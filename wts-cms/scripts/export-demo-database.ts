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
import { BRAND } from "@wts-cms/shared";
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

const fixturePath = path.resolve("database/mongodb/wts-cms-demo-database.json");

const collections = {
  permissions: PermissionModel,
  roles: RoleModel,
  users: UserModel,
  settings: SettingsModel,
  pages: PageModel,
  blogs: BlogModel,
  categories: CategoryModel,
  tags: TagModel,
  menus: MenuModel,
  media: MediaModel,
  forms: FormModel,
  formSubmissions: FormSubmissionModel,
  redirects: RedirectModel,
  locations: LocationModel,
  contentRevisions: ContentRevisionModel,
  notifications: NotificationModel,
  auditLogs: AuditLogModel
};

function sanitizeCollection(name: string, documents: any[]) {
  if (name !== "users") {
    return documents;
  }
  return documents.map((document) => ({
    ...document,
    refreshTokenHashes: []
  }));
}

await connectDatabase();
await fs.mkdir(path.dirname(fixturePath), { recursive: true });

const database = Object.fromEntries(
  await Promise.all(
    Object.entries(collections).map(async ([name, model]) => {
      const documents = await model.find().sort({ createdAt: 1 }).lean();
      return [name, sanitizeCollection(name, documents)];
    })
  )
);

await fs.writeFile(
  fixturePath,
  `${JSON.stringify(
    {
      name: "wts-cms-demo-database",
      project: BRAND.name,
      author: BRAND.company,
      homepage: BRAND.website,
      poweredBy: BRAND.company,
      generatedAt: new Date().toISOString(),
      format: "portable-mongodb-json-fixture",
      notes: [
        "Committed WTS CMS demo database content powered by Webskitters.",
        "Refresh tokens and preview tokens are intentionally excluded from this fixture.",
        "Default admin credentials are documented in README and must be changed after restore."
      ],
      collections: database
    },
    null,
    2
  )}\n`
);

await disconnectDatabase();
process.stdout.write(`WTS CMS demo database exported: ${fixturePath}\n`);
