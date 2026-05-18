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

const maxSearchLength = 160;
const maxSlugLikeLength = 80;

export function safeObjectId(value: unknown): Types.ObjectId {
  const id = typeof value === "string" ? value.trim() : "";
  if (!isHexObjectId(id)) {
    throw Object.assign(new Error("Invalid resource identifier"), { status: 400 });
  }
  return new Types.ObjectId(id);
}

export function safeSearchRegex(value: unknown): RegExp | null {
  const text = typeof value === "string" ? value.trim().slice(0, maxSearchLength) : "";
  if (!text || !isSafeSearchText(text)) {
    return null;
  }
  return new RegExp(escapeRegExp(text), "i");
}

export function safeSlugLike(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return isSafeSlugLike(text) ? text : null;
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
  return key !== "__proto__" && key !== "constructor" && key !== "prototype" && !key.includes("$") && !key.includes(".");
}

function escapeRegExp(value: string): string {
  let escaped = "";
  for (const char of value) {
    escaped += isRegexMetaCharacter(char) ? `\\${char}` : char;
  }
  return escaped;
}

function isHexObjectId(value: string): boolean {
  if (value.length !== 24) {
    return false;
  }
  for (const char of value) {
    const code = char.charCodeAt(0);
    const isDigit = code >= 48 && code <= 57;
    const isLowerHex = code >= 97 && code <= 102;
    const isUpperHex = code >= 65 && code <= 70;
    if (!isDigit && !isLowerHex && !isUpperHex) {
      return false;
    }
  }
  return true;
}

function isSafeSearchText(value: string): boolean {
  if (value.length > maxSearchLength) {
    return false;
  }
  for (const char of value) {
    if (char.trim() === "") {
      continue;
    }
    if (isSearchPunctuation(char) || isLetterOrNumber(char)) {
      continue;
    }
    return false;
  }
  return true;
}

function isSafeSlugLike(value: string): boolean {
  if (!value || value.length > maxSlugLikeLength || !isAsciiLetterOrDigit(value.charAt(0))) {
    return false;
  }
  for (const char of value) {
    if (!isAsciiLetterOrDigit(char) && char !== "_" && char !== "-") {
      return false;
    }
  }
  return true;
}

function isLetterOrNumber(char: string): boolean {
  return char.toLocaleLowerCase() !== char.toLocaleUpperCase() || isAsciiDigit(char);
}

function isAsciiLetterOrDigit(char: string): boolean {
  const code = char.charCodeAt(0);
  return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

function isAsciiDigit(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 48 && code <= 57;
}

function isSearchPunctuation(char: string): boolean {
  return char === "." || char === "," || char === "'" || char === "@" || char === ":" || char === "_" || char === "/" || char === "-";
}

function isRegexMetaCharacter(char: string): boolean {
  return char === "\\" || char === "^" || char === "$" || char === "*" || char === "+" || char === "?" || char === "." || char === "(" || char === ")" || char === "|" || char === "[" || char === "]" || char === "{" || char === "}";
}
