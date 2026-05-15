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
import type { Model } from "mongoose";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbac.js";
import { validate } from "../middleware/validate.js";
import { audit } from "../modules/audit-logs/audit.service.js";
import { asyncHandler } from "./async-handler.js";
import { created, fail, ok } from "./api-response.js";
import { createChangeSet } from "./diff.js";
import { getPagination, paginationMeta } from "./pagination.js";
import { safeObjectId, safeSearchRegex, safeSlugLike } from "./safe-query.js";
import type { PermissionKey } from "@wts-cms/shared";

interface CrudOptions {
  model: Model<any>;
  resource: string;
  permissions: {
    create: PermissionKey;
    read: PermissionKey;
    update: PermissionKey;
    delete: PermissionKey;
  };
  schema?: z.ZodSchema;
  beforeCreate?: (body: any, req: any) => Promise<any> | any;
  beforeUpdate?: (document: any, body: any, req: any) => Promise<any> | any;
  preventDelete?: (document: any, req: any) => Promise<string | null> | string | null;
  searchFields?: string[];
}

export function createCrudRouter(options: CrudOptions) {
  const router = Router();
  const idSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) });

  router.use(authenticate);

  router.get(
    "/",
    requirePermission(options.permissions.read),
    asyncHandler(async (req, res) => {
      const { page, limit, skip } = getPagination(req.query);
      const query: Record<string, unknown> = {};
      const search = safeSearchRegex(req.query.search);
      if (search && options.searchFields?.length) {
        query.$or = options.searchFields.map((field) => ({
          [field]: search
        }));
      }
      for (const key of ["status", "role", "location"]) {
        const value = safeSlugLike(req.query[key]);
        if (value) {
          query[key] = value;
        }
      }
      const [items, total] = await Promise.all([
        options.model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        options.model.countDocuments(query)
      ]);
      return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
    })
  );

  router.post(
    "/",
    requirePermission(options.permissions.create),
    options.schema ? validate(options.schema) : (_req, _res, next) => next(),
    asyncHandler(async (req, res) => {
      const body = options.beforeCreate ? await options.beforeCreate(req.body, req) : req.body;
      const document = await options.model.create(body);
      await audit(req, `create ${options.resource}`, options.resource, document._id.toString());
      return created(res, document);
    })
  );

  router.get(
    "/:id",
    requirePermission(options.permissions.read),
    validate(idSchema, "params"),
    asyncHandler(async (req, res) => {
      const document = await options.model.findById(safeObjectId(req.params.id));
      if (!document) {
        return fail(res, 404, "Resource not found", "RESOURCE_NOT_FOUND");
      }
      return ok(res, document);
    })
  );

  router.patch(
    "/:id",
    requirePermission(options.permissions.update),
    validate(idSchema, "params"),
    options.schema ? validate((options.schema as any).partial ? (options.schema as any).partial() : options.schema) : (_req, _res, next) => next(),
    asyncHandler(async (req, res) => {
      const document = await options.model.findById(safeObjectId(req.params.id));
      if (!document) {
        return fail(res, 404, "Resource not found", "RESOURCE_NOT_FOUND");
      }
      const before = document.toObject();
      const body = options.beforeUpdate ? await options.beforeUpdate(document, req.body, req) : req.body;
      Object.assign(document, body);
      await document.save();
      await audit(req, `update ${options.resource}`, options.resource, document._id.toString(), {
        changes: createChangeSet(before, document.toObject())
      });
      return ok(res, document);
    })
  );

  router.delete(
    "/:id",
    requirePermission(options.permissions.delete),
    validate(idSchema, "params"),
    asyncHandler(async (req, res) => {
      const document = await options.model.findById(safeObjectId(req.params.id));
      if (!document) {
        return fail(res, 404, "Resource not found", "RESOURCE_NOT_FOUND");
      }
      const reason = options.preventDelete ? await options.preventDelete(document, req) : null;
      if (reason) {
        return fail(res, 400, reason, "DELETE_BLOCKED");
      }
      await document.deleteOne();
      await audit(req, `delete ${options.resource}`, options.resource, document._id.toString());
      return ok(res, {});
    })
  );

  return router;
}

export function slugFromName(body: any, field = "name") {
  return { ...body, slug: body.slug ? createSlug(body.slug) : createSlug(body[field]) };
}
