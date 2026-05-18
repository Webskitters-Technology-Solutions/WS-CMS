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
  BlogModel,
  CategoryModel,
  FormModel,
  FormSubmissionModel,
  LocationModel,
  MediaModel,
  MenuModel,
  NotificationModel,
  PageModel,
  RedirectModel,
  RoleModel,
  SettingsModel,
  TagModel,
  UserModel
} from "../apps/api/src/database/models.js";

const backupDir = path.resolve("backups");

const collections = {
  roles: RoleModel,
  users: UserModel,
  pages: PageModel,
  blogs: BlogModel,
  categories: CategoryModel,
  tags: TagModel,
  menus: MenuModel,
  media: MediaModel,
  forms: FormModel,
  formSubmissions: FormSubmissionModel,
  redirects: RedirectModel,
  settings: SettingsModel,
  locations: LocationModel,
  notifications: NotificationModel
};

await connectDatabase();
await fs.mkdir(backupDir, { recursive: true });
const backup = Object.fromEntries(
  await Promise.all(
    Object.entries(collections).map(async ([name, model]) => [name, await model.find().lean()])
  )
);
const filename = path.join(backupDir, `wts-cms-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
await fs.writeFile(filename, JSON.stringify({ poweredBy: "Webskitters Technology Solutions Pvt. Ltd.", backup }, null, 2));
await disconnectDatabase();
console.warn(`WTS CMS backup created: ${filename}`);
