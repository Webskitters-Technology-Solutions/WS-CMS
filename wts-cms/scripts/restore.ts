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
import fs from "node:fs/promises";
import { connectDatabase, disconnectDatabase } from "../apps/api/src/database/connection.js";
import {
  BlogModel,
  CategoryModel,
  LocationModel,
  MediaModel,
  MenuModel,
  PageModel,
  RedirectModel,
  RoleModel,
  SettingsModel,
  TagModel,
  UserModel
} from "../apps/api/src/database/models.js";

const filename = process.argv[2];
if (!filename) {
  throw new Error("Usage: pnpm restore -- backups/wts-cms-backup-file.json");
}

const payload = JSON.parse(await fs.readFile(filename, "utf8"));
const backup = payload.backup || {};
const collections = [
  ["roles", RoleModel],
  ["users", UserModel],
  ["pages", PageModel],
  ["blogs", BlogModel],
  ["categories", CategoryModel],
  ["tags", TagModel],
  ["menus", MenuModel],
  ["media", MediaModel],
  ["redirects", RedirectModel],
  ["settings", SettingsModel],
  ["locations", LocationModel]
] as const;

await connectDatabase();
for (const [name, model] of collections) {
  if (Array.isArray(backup[name])) {
    await model.deleteMany({});
    if (backup[name].length) {
      await model.insertMany(backup[name], { ordered: false });
    }
  }
}
await disconnectDatabase();
console.warn(`WTS CMS backup restored from: ${filename}`);
