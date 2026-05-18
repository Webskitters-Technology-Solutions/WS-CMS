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
import { PageModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { fail, ok } from "../../utils/api-response.js";
import { contentSchema, idParamSchema } from "../../validators/cms.js";
import { validate } from "../../middleware/validate.js";
import { createContentRouter } from "../content-routes.js";
import {
  archiveContent,
  createPreviewToken,
  publishContent,
  restoreContentRevision
} from "../content-workflow.js";
import { ContentRevisionModel } from "../../database/models.js";

export const pagesRouter = Router();
pagesRouter.use(
  createContentRouter({
    model: PageModel,
    resource: "page",
    permissions: {
      create: "pages:create",
      read: "pages:read",
      update: "pages:update",
      delete: "pages:delete",
      publish: "pages:publish"
    },
    schema: contentSchema
  })
);

pagesRouter.post(
  "/:id/publish",
  authenticate,
  requirePermission("pages:publish"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const page = await publishContent(PageModel, "page", String(req.params.id), req);
    return page ? ok(res, page) : fail(res, 404, "Page not found", "PAGE_NOT_FOUND");
  })
);

pagesRouter.post(
  "/:id/archive",
  authenticate,
  requirePermission("pages:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const page = await archiveContent(PageModel, "page", String(req.params.id), req);
    return page ? ok(res, page) : fail(res, 404, "Page not found", "PAGE_NOT_FOUND");
  })
);

pagesRouter.get(
  "/:id/revisions",
  authenticate,
  requirePermission("pages:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) =>
    ok(res, await ContentRevisionModel.find({ entityType: "page", entityId: String(req.params.id) }).sort({ createdAt: -1 }).limit(50))
  )
);

pagesRouter.post(
  "/:id/revisions/:revisionId/restore",
  authenticate,
  requirePermission("pages:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const page = await restoreContentRevision(PageModel, "page", String(req.params.id), String(req.params.revisionId), req);
    return page ? ok(res, page) : fail(res, 404, "Revision not found", "REVISION_NOT_FOUND");
  })
);

pagesRouter.post(
  "/:id/preview-token",
  authenticate,
  requirePermission("pages:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const page = await PageModel.findById(req.params.id);
    if (!page) {
      return fail(res, 404, "Page not found", "PAGE_NOT_FOUND");
    }
    return ok(res, await createPreviewToken("page", String(req.params.id), req));
  })
);
