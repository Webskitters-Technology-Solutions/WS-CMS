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
import { AuditLogModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";

export const auditLogsRouter = Router();
auditLogsRouter.get(
  "/",
  authenticate,
  requirePermission("auditLogs:read"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const [items, total] = await Promise.all([
      AuditLogModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLogModel.countDocuments()
    ]);
    return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
  })
);
