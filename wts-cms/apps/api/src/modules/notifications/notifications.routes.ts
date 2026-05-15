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
import { Router } from "express";
import { NotificationModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";
import { safeObjectId } from "../../utils/safe-query.js";
import { idParamSchema } from "../../validators/cms.js";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

function parseNotificationStatus(value: unknown): "read" | "unread" | undefined {
  return value === "read" || value === "unread" ? value : undefined;
}

notificationsRouter.get(
  "/",
  requirePermission("notifications:read"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const status = parseNotificationStatus(req.query.status);
    const query = status ? { status } : {};
    const [items, total] = await Promise.all([
      NotificationModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      NotificationModel.countDocuments(query)
    ]);
    return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
  })
);

notificationsRouter.patch(
  "/:id/read",
  requirePermission("notifications:update"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => ok(res, await NotificationModel.findByIdAndUpdate(safeObjectId(req.params.id), { status: "read" }, { returnDocument: "after" })))
);

notificationsRouter.post(
  "/read-all",
  requirePermission("notifications:update"),
  asyncHandler(async (_req, res) => {
    await NotificationModel.updateMany({ status: "unread" }, { status: "read" });
    return ok(res, { updated: true });
  })
);
