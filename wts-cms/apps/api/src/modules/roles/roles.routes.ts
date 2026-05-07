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
import { createSlug } from "@wts-cms/shared";
import { RoleModel } from "../../database/models.js";
import { createCrudRouter } from "../../utils/crud-router.js";
import { roleSchema } from "../../validators/cms.js";

export const rolesRouter = createCrudRouter({
  model: RoleModel,
  resource: "role",
  permissions: {
    create: "roles:create",
    read: "roles:read",
    update: "roles:update",
    delete: "roles:delete"
  },
  schema: roleSchema,
  searchFields: ["name", "description"],
  beforeCreate: (body, req) => {
    if (body.permissions?.some((key: string) => !req.user?.permissions.includes(key as any))) {
      throw Object.assign(new Error("Cannot grant permissions you do not have"), { status: 403 });
    }
    return { ...body, slug: body.slug ? createSlug(body.slug) : createSlug(body.name), isSystem: false };
  },
  beforeUpdate: (document, body, req) => {
    if (document.slug === "super-admin" && req.user?.roleSlug !== "super-admin") {
      throw Object.assign(new Error("Only Super Admin can update Super Admin role"), { status: 403 });
    }
    if (body.permissions?.some((key: string) => !req.user?.permissions.includes(key as any))) {
      throw Object.assign(new Error("Cannot grant permissions you do not have"), { status: 403 });
    }
    return { ...body, slug: body.slug ? createSlug(body.slug) : body.slug, isSystem: document.isSystem };
  },
  preventDelete: (document) => (document.isSystem ? "System roles cannot be deleted." : null)
});
