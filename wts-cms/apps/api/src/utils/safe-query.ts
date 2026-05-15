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
import { Types } from "mongoose";

const objectIdPattern = /^[a-f\d]{24}$/i;
const textPattern = /^[\p{L}\p{N}\s.,'@:_/-]{0,160}$/u;
const slugLikePattern = /^[a-z0-9][a-z0-9_-]{0,79}$/i;
const unsafeMongoKeyPattern = /[$.]/;

export function safeObjectId(value: unknown): Types.ObjectId {
  const id = typeof value === "string" ? value.trim() : "";
  if (!objectIdPattern.test(id)) {
    throw Object.assign(new Error("Invalid resource identifier"), { status: 400 });
  }
  return new Types.ObjectId(id);
}

export function safeSearchRegex(value: unknown): RegExp | null {
  const text = typeof value === "string" ? value.trim().slice(0, 160) : "";
  if (!text || !textPattern.test(text)) {
    return null;
  }
  return new RegExp(escapeRegExp(text), "i");
}

export function safeSlugLike(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return slugLikePattern.test(text) ? text : null;
}

export function safeStatus<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  return typeof value === "string" && allowed.includes(value) ? value : null;
}

export function safeMongoUpdate(value: unknown): Record<string, unknown> {
  const sanitized = sanitizeMongoValue(value);
  return isPlainRecord(sanitized) ? sanitized : {};
}

function sanitizeMongoValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeMongoValue);
  }
  if (!isPlainRecord(value)) {
    return value;
  }
  const clean: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (!isSafeMongoKey(key)) {
      continue;
    }
    clean[key] = sanitizeMongoValue(child);
  }
  return clean;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype;
}

function isSafeMongoKey(key: string): boolean {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype" && !unsafeMongoKeyPattern.test(key);
}

function escapeRegExp(value: string): string {
  return value.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}
