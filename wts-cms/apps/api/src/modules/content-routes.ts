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
import { buildPermalink, createSlug } from "@wts-cms/shared";
import type { Model } from "mongoose";
import { RedirectModel } from "../database/models.js";
import { sanitizeCmsHtml, calculateReadingTime, tableOfContents } from "../utils/content.js";
import { createCrudRouter } from "../utils/crud-router.js";
import { saveContentRevision } from "./content-workflow.js";
import type { PermissionKey } from "@wts-cms/shared";

interface ContentRouteOptions {
  model: Model<any>;
  resource: "page" | "blog" | "location";
  prefix?: string;
  permissions: {
    create: PermissionKey;
    read: PermissionKey;
    update: PermissionKey;
    delete: PermissionKey;
    publish?: PermissionKey;
  };
  schema: any;
}

export function createContentRouter(options: ContentRouteOptions) {
  return createCrudRouter({
    model: options.model,
    resource: options.resource,
    permissions: options.permissions,
    schema: options.schema,
    searchFields: options.resource === "location" ? ["name", "h1"] : ["title", "h1", "excerpt"],
    beforeCreate: async (body, req) => normalizeContent(body, req, options),
    beforeUpdate: async (document, body, req) => {
      const previousPermalink = document.permalink;
      await saveContentRevision(document, options.resource, req, "update");
      const normalized = await normalizeContent({ ...document.toObject(), ...body }, req, options);
      if (
        previousPermalink &&
        normalized.permalink &&
        previousPermalink !== normalized.permalink &&
        document.status === "published"
      ) {
        await RedirectModel.findOneAndUpdate(
          { source: previousPermalink },
          {
            source: previousPermalink,
            destination: normalized.permalink,
            statusCode: 301,
            createdReason: "slug_change",
            entityType: options.resource,
            entityId: document._id,
            isActive: true
          },
          { upsert: true, returnDocument: "after" }
        );
      }
      return normalized;
    }
  });
}

async function normalizeContent(body: any, req: any, options: ContentRouteOptions) {
  const title = body.title || body.name;
  const slug = body.slug ? createSlug(body.slug) : createSlug(title);
  const content = sanitizeCmsHtml(body.content || "");
  const permalink =
    body.permalink ||
    buildPermalink(slug, [], options.resource === "blog" ? "blog" : options.resource === "location" ? "locations" : "");
  const normalized = {
    ...body,
    slug,
    permalink,
    h1: body.h1 || title,
    content,
    blocks: normalizeBlocks(body.blocks),
    createdBy: body.createdBy || req.user?.id,
    updatedBy: req.user?.id
  };
  if (options.resource === "blog") {
    normalized.readingTime = calculateReadingTime(content);
    normalized.tableOfContents = tableOfContents(content);
    normalized.authorName = body.authorName || "Webskitters Editorial Team";
  }
  return normalized;
}

function normalizeBlocks(blocks: unknown) {
  if (!Array.isArray(blocks)) {
    return [];
  }
  return blocks.map((block, index) => {
    if (!block || typeof block !== "object") {
      return {
        id: `block-${index}`,
        type: "content",
        schemaVersion: 1
      };
    }
    const value = block as Record<string, unknown>;
    return {
      schemaVersion: Number(value.schemaVersion || 1),
      ...value,
      id: String(value.id || `${value.type || "block"}-${index}`)
    };
  });
}
