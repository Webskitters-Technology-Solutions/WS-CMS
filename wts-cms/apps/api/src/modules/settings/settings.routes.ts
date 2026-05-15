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
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";
import { settingsSchema } from "../../validators/cms.js";
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
  validate(settingsSchema),
  asyncHandler(async (req, res) => {
    const settings = await getSettings();
    assignSettingsUpdates(settings, req.body);
    await settings.save();
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

function assignSettingsUpdates(settings: any, body: any) {
  for (const field of [
    "siteName",
    "siteUrl",
    "defaultMetaTitle",
    "defaultMetaDescription",
    "defaultOgImage",
    "gtmContainerId",
    "robotsTxt",
    "organisationSchema",
    "footerText",
    "poweredByText"
  ]) {
    if (typeof body[field] === "string") {
      settings[field] = body[field];
    }
  }
  if (Array.isArray(body.businessLocations)) {
    settings.businessLocations = body.businessLocations;
  }
  if (body.seoAdminPreferences && typeof body.seoAdminPreferences === "object") {
    settings.seoAdminPreferences = body.seoAdminPreferences;
  }
  if (body.socialLinks && typeof body.socialLinks === "object") {
    settings.socialLinks = body.socialLinks;
  }
}
