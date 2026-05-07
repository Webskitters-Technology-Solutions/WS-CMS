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
import type { Model } from "mongoose";
import { z } from "zod";
import {
  BlogModel,
  CategoryModel,
  FormModel,
  LocationModel,
  MenuModel,
  PageModel,
  RedirectModel,
  SettingsModel,
  TagModel
} from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { validate } from "../../middleware/validate.js";
import { audit } from "../audit-logs/audit.service.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";

const resourceConfig = {
  pages: { model: PageModel, uniqueKey: "permalink" },
  blogs: { model: BlogModel, uniqueKey: "permalink" },
  categories: { model: CategoryModel, uniqueKey: "slug" },
  tags: { model: TagModel, uniqueKey: "slug" },
  menus: { model: MenuModel, uniqueKey: "slug" },
  redirects: { model: RedirectModel, uniqueKey: "source" },
  forms: { model: FormModel, uniqueKey: "slug" },
  settings: { model: SettingsModel, uniqueKey: "_id" },
  locations: { model: LocationModel, uniqueKey: "permalink" }
} satisfies Record<string, { model: Model<any>; uniqueKey: string }>;

type ResourceKey = keyof typeof resourceConfig;

const importSchema = z.object({
  mode: z.enum(["upsert", "replace"]).default("upsert"),
  resources: z.record(z.array(z.record(z.unknown()))).default({})
});

export const importExportRouter = Router();
importExportRouter.use(authenticate);

function selectedResources(value: unknown): ResourceKey[] {
  const requested = String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const allowed = Object.keys(resourceConfig) as ResourceKey[];
  return requested.length ? allowed.filter((key) => requested.includes(key)) : allowed;
}

function cleanDocument(document: Record<string, unknown>) {
  const cleaned = { ...document };
  delete cleaned.__v;
  return cleaned;
}

importExportRouter.get(
  "/export",
  requirePermission("settings:read"),
  asyncHandler(async (req, res) => {
    const resources = selectedResources(req.query.resources);
    const exported: Record<string, unknown[]> = {};
    for (const resource of resources) {
      const model = resourceConfig[resource].model as Model<any>;
      exported[resource] = await model.find({}).sort({ createdAt: 1 }).lean();
    }
    return ok(res, {
      project: "WTS CMS",
      poweredBy: "Webskitters Technology Solutions Pvt. Ltd.",
      exportedAt: new Date().toISOString(),
      schemaVersion: 1,
      resources: exported
    });
  })
);

importExportRouter.post(
  "/import",
  requirePermission("settings:update"),
  validate(importSchema),
  asyncHandler(async (req, res) => {
    const resources = req.body.resources as Record<string, Record<string, unknown>[]>;
    const summary: Record<string, { received: number; imported: number }> = {};

    for (const [resource, documents] of Object.entries(resources)) {
      if (!(resource in resourceConfig) || !Array.isArray(documents)) {
        continue;
      }
      const config = resourceConfig[resource as ResourceKey];
      const model = config.model as Model<any>;
      if (req.body.mode === "replace") {
        await model.deleteMany({});
      }

      let imported = 0;
      for (const document of documents) {
        const clean = cleanDocument(document);
        const uniqueValue = clean[config.uniqueKey];
        if (req.body.mode === "upsert" && uniqueValue) {
          if (config.uniqueKey !== "_id") {
            delete clean._id;
          }
          await model.findOneAndUpdate({ [config.uniqueKey]: uniqueValue }, clean, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
          });
        } else {
          await model.create(clean);
        }
        imported += 1;
      }
      summary[resource] = { received: documents.length, imported };
    }

    await audit(req, "import content", "import-export", undefined, summary);
    return ok(res, {
      project: "WTS CMS",
      poweredBy: "Webskitters Technology Solutions Pvt. Ltd.",
      summary
    });
  })
);
