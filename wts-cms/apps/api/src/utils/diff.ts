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
const ignoredKeys = new Set(["_id", "__v", "createdAt", "updatedAt", "passwordHash", "refreshTokenHashes"]);

function normalizeValue(value: unknown): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !ignoredKeys.has(key))
        .map(([key, nested]) => [key, normalizeValue(nested)])
    );
  }
  return value;
}

export function createChangeSet(before: Record<string, unknown>, after: Record<string, unknown>) {
  const beforeNormalized = normalizeValue(before) as Record<string, unknown>;
  const afterNormalized = normalizeValue(after) as Record<string, unknown>;
  const keys = new Set([...Object.keys(beforeNormalized), ...Object.keys(afterNormalized)]);

  return Array.from(keys)
    .filter((key) => JSON.stringify(beforeNormalized[key]) !== JSON.stringify(afterNormalized[key]))
    .map((key) => ({
      field: key,
      before: beforeNormalized[key] ?? null,
      after: afterNormalized[key] ?? null
    }));
}
