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
import { UserModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { audit } from "../audit-logs/audit.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { fail, ok } from "../../utils/api-response.js";

export const sessionsRouter = Router();

sessionsRouter.use(authenticate);

sessionsRouter.get(
  "/",
  requirePermission("sessions:read"),
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user?.id).select("email firstName lastName refreshTokenHashes lastLoginAt updatedAt");
    if (!user) {
      return fail(res, 404, "User not found", "USER_NOT_FOUND");
    }
    return ok(res, {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        lastLoginAt: user.lastLoginAt,
        updatedAt: user.updatedAt
      },
      activeRefreshSessions: user.refreshTokenHashes.length
    });
  })
);

sessionsRouter.delete(
  "/",
  requirePermission("sessions:update"),
  asyncHandler(async (req, res) => {
    await UserModel.findByIdAndUpdate(req.user?.id, { refreshTokenHashes: [] });
    await audit(req, "revoke sessions", "session", req.user?.id || "");
    return ok(res, { revoked: true });
  })
);
