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
export const PERMISSION_KEYS = [
  "auth:read",
  "users:create",
  "users:read",
  "users:update",
  "users:delete",
  "roles:create",
  "roles:read",
  "roles:update",
  "roles:delete",
  "permissions:read",
  "pages:create",
  "pages:read",
  "pages:update",
  "pages:delete",
  "pages:publish",
  "blogs:create",
  "blogs:read",
  "blogs:update",
  "blogs:delete",
  "blogs:publish",
  "categories:create",
  "categories:read",
  "categories:update",
  "categories:delete",
  "tags:create",
  "tags:read",
  "tags:update",
  "tags:delete",
  "menus:create",
  "menus:read",
  "menus:update",
  "menus:delete",
  "media:create",
  "media:read",
  "media:update",
  "media:delete",
  "redirects:create",
  "redirects:read",
  "redirects:update",
  "redirects:delete",
  "settings:read",
  "settings:update",
  "seo:read",
  "seo:update",
  "locations:create",
  "locations:read",
  "locations:update",
  "locations:delete",
  "auditLogs:read"
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

export const SYSTEM_ROLES = ["Super Admin", "Admin", "Editor", "Author", "Viewer"] as const;
