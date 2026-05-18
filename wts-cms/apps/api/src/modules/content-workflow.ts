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
import crypto from "node:crypto";
import type { Request } from "express";
import type { Model } from "mongoose";
import { ContentRevisionModel, PreviewTokenModel } from "../database/models.js";
import { audit } from "./audit-logs/audit.service.js";

export type ContentEntityType = "page" | "blog" | "location";

export async function saveContentRevision(document: any, entityType: ContentEntityType, req: Request, reason = "update") {
  if (!document) {
    return null;
  }

  return ContentRevisionModel.create({
    entityType,
    entityId: document._id,
    title: document.title || document.name || "",
    status: document.status || "",
    snapshot: document.toObject ? document.toObject() : document,
    createdBy: req.user?.id,
    reason
  });
}

export async function publishContent(model: Model<any>, entityType: ContentEntityType, id: string, req: Request) {
  const document = await model.findById(id);
  if (!document) {
    return null;
  }
  await saveContentRevision(document, entityType, req, "publish");
  document.status = "published";
  document.publishedAt = new Date();
  await document.save();
  await audit(req, `publish ${entityType}`, entityType, document._id.toString(), { status: "published" });
  return document;
}

export async function archiveContent(model: Model<any>, entityType: ContentEntityType, id: string, req: Request) {
  const document = await model.findById(id);
  if (!document) {
    return null;
  }
  await saveContentRevision(document, entityType, req, "archive");
  document.status = "archived";
  await document.save();
  await audit(req, `archive ${entityType}`, entityType, document._id.toString(), { status: "archived" });
  return document;
}

export async function restoreContentRevision(model: Model<any>, entityType: ContentEntityType, id: string, revisionId: string, req: Request) {
  const revision = await ContentRevisionModel.findOne({ _id: revisionId, entityType, entityId: id });
  const document = await model.findById(id);
  if (!revision || !document) {
    return null;
  }
  await saveContentRevision(document, entityType, req, "pre_restore");
  const snapshot = revision.snapshot as Record<string, unknown>;
  for (const [key, value] of Object.entries(snapshot)) {
    if (!["_id", "__v", "createdAt", "updatedAt"].includes(key)) {
      document.set(key, value);
    }
  }
  document.updatedBy = req.user?.id;
  await document.save();
  await audit(req, `restore ${entityType}`, entityType, document._id.toString(), { revisionId });
  return document;
}

export async function createPreviewToken(entityType: ContentEntityType, entityId: string, req: Request) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  const preview = await PreviewTokenModel.create({
    token,
    entityType,
    entityId,
    expiresAt,
    createdBy: req.user?.id
  });
  await audit(req, `create ${entityType} preview`, entityType, entityId, { expiresAt });
  return preview;
}
