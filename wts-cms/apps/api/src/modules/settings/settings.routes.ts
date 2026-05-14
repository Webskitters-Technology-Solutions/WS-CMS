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
import { SettingsModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";
import { audit } from "../audit-logs/audit.service.js";

export const settingsRouter = Router();

settingsRouter.get(
  "/",
  authenticate,
  requirePermission("settings:read"),
  asyncHandler(async (_req, res) => ok(res, await getSettings()))
);

settingsRouter.patch(
  "/",
  authenticate,
  requirePermission("settings:update"),
  asyncHandler(async (req, res) => {
    const settings = await SettingsModel.findOneAndUpdate({}, req.body, { upsert: true, returnDocument: "after" });
    await audit(req, "update settings", "settings", settings._id.toString());
    return ok(res, settings);
  })
);

export async function getSettings() {
  return SettingsModel.findOneAndUpdate(
    {},
    { $setOnInsert: { poweredByText: "Powered by Webskitters Technology Solutions Pvt. Ltd." } },
    { upsert: true, returnDocument: "after" }
  );
}
