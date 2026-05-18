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
import fs from "node:fs/promises";
import path from "node:path";
import { connectDatabase, disconnectDatabase } from "../apps/api/src/database/connection.js";
import {
  AuditLogModel,
  BlogModel,
  CategoryModel,
  ContentRevisionModel,
  FormModel,
  FormSubmissionModel,
  LocationModel,
  MediaModel,
  MenuModel,
  NotificationModel,
  PageModel,
  PermissionModel,
  RedirectModel,
  RoleModel,
  SettingsModel,
  TagModel,
  UserModel
} from "../apps/api/src/database/models.js";

const fixturePath = path.resolve(process.argv[2] || "database/mongodb/wts-cms-demo-database.json");

const collections = [
  ["permissions", PermissionModel],
  ["roles", RoleModel],
  ["users", UserModel],
  ["settings", SettingsModel],
  ["pages", PageModel],
  ["blogs", BlogModel],
  ["categories", CategoryModel],
  ["tags", TagModel],
  ["menus", MenuModel],
  ["media", MediaModel],
  ["forms", FormModel],
  ["formSubmissions", FormSubmissionModel],
  ["redirects", RedirectModel],
  ["locations", LocationModel],
  ["contentRevisions", ContentRevisionModel],
  ["notifications", NotificationModel],
  ["auditLogs", AuditLogModel]
] as const;

const payload = JSON.parse(await fs.readFile(fixturePath, "utf8"));
const database = payload.collections || {};

await connectDatabase();
for (const [name, model] of collections) {
  if (Array.isArray(database[name])) {
    await model.deleteMany({});
    if (database[name].length > 0) {
      await model.insertMany(database[name], { ordered: false });
    }
  }
}
await disconnectDatabase();

process.stdout.write(`WTS CMS demo database imported: ${fixturePath}\n`);
