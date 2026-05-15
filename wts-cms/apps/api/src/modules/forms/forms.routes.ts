/**
 * ================================================================
 *  __        __   _     ____  _  _______ _____ _____ _____ _____
 *  \ \      / /__| |__ / ___|| |/ /_   _|_   _| ____|_   _/ ____|
 *   \ \ /\ / / _ \ '_ \\___ \| ' /  | |   | | |  _|   | | \___ \
 *    \ V  V /  __/ |_) |___) | . \  | |   | | | |___  | |  ___) |
 *     \_/\_/ \___|_.__/|____/|_|\_\ |_|   |_| |_____| |_| |____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
import { createSlug } from "@wts-cms/shared";
import { Router } from "express";
import { FormModel, FormSubmissionModel, NotificationModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { audit } from "../audit-logs/audit.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { created, fail, ok } from "../../utils/api-response.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";
import { safeObjectId, safeSearchRegex, safeSlugLike, safeStatus } from "../../utils/safe-query.js";
import { formSchema, formSubmissionSchema, idParamSchema } from "../../validators/cms.js";

export const formsRouter = Router();

formsRouter.use(authenticate);

formsRouter.get(
  "/",
  requirePermission("forms:read"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const search = safeSearchRegex(req.query.search);
    const query = search ? { name: search } : {};
    const [items, total] = await Promise.all([
      FormModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      FormModel.countDocuments(query)
    ]);
    return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
  })
);

formsRouter.post(
  "/",
  requirePermission("forms:create"),
  validate(formSchema),
  asyncHandler(async (req, res) => {
    const form = await FormModel.create({
      ...req.body,
      slug: req.body.slug ? createSlug(req.body.slug) : createSlug(req.body.name),
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    });
    await audit(req, "create form", "form", form._id.toString());
    return created(res, form);
  })
);

formsRouter.get(
  "/submissions",
  requirePermission("forms:read"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
      FormSubmissionModel.find().populate("form", "name slug").sort({ createdAt: -1 }).skip(skip).limit(limit),
      FormSubmissionModel.countDocuments()
    ]);
    return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
  })
);

formsRouter.patch(
  "/submissions/:id",
  requirePermission("forms:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const status = safeStatus(req.body.status, ["new", "read", "archived"] as const) || "read";
    const submission = await FormSubmissionModel.findByIdAndUpdate(safeObjectId(req.params.id), { status }, { returnDocument: "after" });
    return submission ? ok(res, submission) : fail(res, 404, "Submission not found", "SUBMISSION_NOT_FOUND");
  })
);

formsRouter.get(
  "/:id",
  requirePermission("forms:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const form = await FormModel.findById(safeObjectId(req.params.id));
    return form ? ok(res, form) : fail(res, 404, "Form not found", "FORM_NOT_FOUND");
  })
);

formsRouter.patch(
  "/:id",
  requirePermission("forms:update"),
  validate(idParamSchema, "params"),
  validate(formSchema.partial()),
  asyncHandler(async (req, res) => {
    const form = await FormModel.findById(safeObjectId(req.params.id));
    if (!form) {
      return fail(res, 404, "Form not found", "FORM_NOT_FOUND");
    }
    assignFormUpdates(form, req.body, req.user?.id);
    await form.save();
    await audit(req, "update form", "form", form._id.toString());
    return ok(res, form);
  })
);

function assignFormUpdates(form: any, body: any, userId?: string) {
  if (typeof body.name === "string") {
    form.name = body.name;
  }
  if (typeof body.slug === "string" && body.slug) {
    form.slug = createSlug(body.slug);
  }
  if (typeof body.description === "string") {
    form.description = body.description;
  }
  if (Array.isArray(body.fields)) {
    form.fields = body.fields;
  }
  if (body.status === "active" || body.status === "inactive") {
    form.status = body.status;
  }
  if (typeof body.notificationEmail === "string") {
    form.notificationEmail = body.notificationEmail;
  }
  if (typeof body.successMessage === "string") {
    form.successMessage = body.successMessage;
  }
  if (typeof body.honeypotField === "string") {
    form.honeypotField = body.honeypotField;
  }
  form.updatedBy = userId;
}

formsRouter.delete(
  "/:id",
  requirePermission("forms:delete"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const form = await FormModel.findByIdAndDelete(safeObjectId(req.params.id));
    if (!form) {
      return fail(res, 404, "Form not found", "FORM_NOT_FOUND");
    }
    await FormSubmissionModel.deleteMany({ form: form._id });
    await audit(req, "delete form", "form", form._id.toString());
    return ok(res, {});
  })
);

export const publicFormsRouter = Router();

publicFormsRouter.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    const slug = safeSlugLike(req.params.slug);
    const form = slug ? await FormModel.findOne({ slug, status: "active" }).select("-notificationEmail") : null;
    return form ? ok(res, form) : fail(res, 404, "Form not found", "FORM_NOT_FOUND");
  })
);

publicFormsRouter.post(
  "/:slug/submit",
  validate(formSubmissionSchema),
  asyncHandler(async (req, res) => {
    const slug = safeSlugLike(req.params.slug);
    const form = slug ? await FormModel.findOne({ slug, status: "active" }) : null;
    if (!form) {
      return fail(res, 404, "Form not found", "FORM_NOT_FOUND");
    }
    const values = req.body.values || {};
    if (form.honeypotField && values[form.honeypotField]) {
      return ok(res, { message: form.successMessage });
    }
    for (const field of form.fields) {
      if (field.required && !values[field.id]) {
        return fail(res, 400, `${field.label} is required`, "FORM_FIELD_REQUIRED", { field: field.id });
      }
    }
    const submission = await FormSubmissionModel.create({
      form: form._id,
      values,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || ""
    });
    await NotificationModel.create({
      title: `New ${form.name} submission`,
      message: `A new WTS CMS form submission was received for ${form.name}.`,
      type: "info",
      resource: "formSubmission",
      resourceId: submission._id
    });
    return created(res, { message: form.successMessage });
  })
);
