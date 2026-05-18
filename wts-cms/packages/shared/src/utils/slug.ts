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
  let slug = "";
  let previousWasHyphen = false;
  const normalized = input.trim().toLowerCase().normalize("NFKD");

  for (const char of normalized) {
    const code = char.charCodeAt(0);
    const isAsciiLetter = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isCombiningMark = code >= 0x0300 && code <= 0x036f;

    if (isAsciiLetter || isDigit) {
      slug += char;
      previousWasHyphen = false;
      continue;
    }

    if (isCombiningMark) {
      continue;
    }

    if (!slug || previousWasHyphen) {
      continue;
    }

    slug += "-";
    previousWasHyphen = true;
  }

  if (slug.endsWith("-")) {
    slug = slug.slice(0, -1);
  }

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
  if (!isLowercaseHyphenSlug(slug)) {
    throw new Error("Slug must be lowercase, hyphenated, and URL safe.");
  }
}

export function normalizePath(path: string): string {
  const trimmed = trimSlashes(path.trim());
  const normalized = `/${trimmed}`;
  return normalized === "/" ? "/" : normalized.toLowerCase();
}

export function trimSlashes(value: string): string {
  let start = 0;
  let end = value.length;
  while (start < end && value[start] === "/") {
    start += 1;
  }
  while (end > start && value[end - 1] === "/") {
    end -= 1;
  }
  return value.slice(start, end);
}

function isLowercaseHyphenSlug(value: string): boolean {
  let previousWasHyphen = false;
  for (let index = 0; index < value.length; index += 1) {
    const char = value.charAt(index);
    const code = char.charCodeAt(0);
    const isLowercaseLetter = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    const isHyphen = char === "-";

    if (isHyphen && (index === 0 || index === value.length - 1 || previousWasHyphen)) {
      return false;
    }

    if (!isLowercaseLetter && !isDigit && !isHyphen) {
      return false;
    }

    previousWasHyphen = isHyphen;
  }
  return true;
}
