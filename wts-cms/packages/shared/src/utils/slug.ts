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
export const RESERVED_PATHS = new Set([
  "admin",
  "api",
  "login",
  "logout",
  "register",
  "sitemap.xml",
  "robots.txt",
  "blog",
  "locations",
  "assets",
  "uploads",
  "_next"
]);

export function createSlug(input: string): string {
  const slug = input
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  validateSlug(slug);
  return slug;
}

export function validateSlug(slug: string): void {
  if (!slug) {
    throw new Error("Slug cannot be empty.");
  }
  if (RESERVED_PATHS.has(slug)) {
    throw new Error(`Slug "${slug}" is reserved.`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must be lowercase, hyphenated, and URL safe.");
  }
}

export function normalizePath(path: string): string {
  const normalized = `/${path.trim().replace(/^\/+|\/+$/g, "")}`;
  return normalized === "/" ? "/" : normalized.toLowerCase();
}
