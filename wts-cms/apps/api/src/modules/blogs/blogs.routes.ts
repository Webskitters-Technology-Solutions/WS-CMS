/**
 * ================================================================
 *  __        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____
 *  \ \      / /| ____| __ )/ ___|| |/ /_ _|_   _|_   _| ____|  _ \/ ___|
 *   \ \ /\ / / |  _| |  _ \\___ \| ' / | |  | |   | | |  _| | |_) \___ \
 *    \ V  V /  | |___| |_) |___) | . \ | |  | |   | | | |___|  _ < ___) |
 *     \_/\_/   |_____|____/|____/|_|\_\___| |_|   |_| |_____|_| \_\____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
import { Router } from "express";
import { BlogModel, ContentRevisionModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { fail, ok } from "../../utils/api-response.js";
import { contentSchema, idParamSchema } from "../../validators/cms.js";
import { createContentRouter } from "../content-routes.js";
import {
  archiveContent,
  createPreviewToken,
  publishContent,
  restoreContentRevision
} from "../content-workflow.js";

export const blogsRouter = Router();
blogsRouter.use(
  createContentRouter({
    model: BlogModel,
    resource: "blog",
    permissions: {
      create: "blogs:create",
      read: "blogs:read",
      update: "blogs:update",
      delete: "blogs:delete",
      publish: "blogs:publish"
    },
    schema: contentSchema
  })
);

blogsRouter.post(
  "/:id/publish",
  authenticate,
  requirePermission("blogs:publish"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const blog = await publishContent(BlogModel, "blog", String(req.params.id), req);
    return blog ? ok(res, blog) : fail(res, 404, "Blog not found", "BLOG_NOT_FOUND");
  })
);

blogsRouter.post(
  "/:id/archive",
  authenticate,
  requirePermission("blogs:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const blog = await archiveContent(BlogModel, "blog", String(req.params.id), req);
    return blog ? ok(res, blog) : fail(res, 404, "Blog not found", "BLOG_NOT_FOUND");
  })
);

blogsRouter.get(
  "/:id/revisions",
  authenticate,
  requirePermission("blogs:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) =>
    ok(res, await ContentRevisionModel.find({ entityType: "blog", entityId: String(req.params.id) }).sort({ createdAt: -1 }).limit(50))
  )
);

blogsRouter.post(
  "/:id/revisions/:revisionId/restore",
  authenticate,
  requirePermission("blogs:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const blog = await restoreContentRevision(BlogModel, "blog", String(req.params.id), String(req.params.revisionId), req);
    return blog ? ok(res, blog) : fail(res, 404, "Revision not found", "REVISION_NOT_FOUND");
  })
);

blogsRouter.post(
  "/:id/preview-token",
  authenticate,
  requirePermission("blogs:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const blog = await BlogModel.findById(req.params.id);
    if (!blog) {
      return fail(res, 404, "Blog not found", "BLOG_NOT_FOUND");
    }
    return ok(res, await createPreviewToken("blog", String(req.params.id), req));
  })
);
