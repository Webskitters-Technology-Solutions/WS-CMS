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
import { Router } from "express";
import sharp from "sharp";
import { MediaModel } from "../../database/models.js";
import { env } from "../../config/env.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { upload } from "../../middleware/upload.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { created, fail, ok } from "../../utils/api-response.js";
import { getPagination, paginationMeta } from "../../utils/pagination.js";
import { safeObjectId, safeSearchRegex, safeSlugLike } from "../../utils/safe-query.js";
import { idParamSchema, mediaUpdateSchema } from "../../validators/cms.js";

export const mediaRouter = Router();
mediaRouter.use(authenticate);

const uploadRoot = path.resolve(env.UPLOAD_DIR);

async function detectImageMime(filePath: string) {
  const buffer = await fs.readFile(filePath);
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  if (buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"))) {
    return "image/gif";
  }
  return "";
}

async function optimizeImage(filePath: string, filename: string, mimeType: string) {
  if (mimeType === "image/gif") {
    const metadata = await sharp(filePath, { animated: true }).metadata().catch(() => ({ width: undefined, height: undefined }));
    const stats = await fs.stat(filePath);
    return {
      filename,
      mimeType,
      size: stats.size,
      width: metadata.width,
      height: metadata.height
    };
  }

  const optimizedFilename = `${path.parse(filename).name}.webp`;
  const optimizedPath = safeUploadPath(optimizedFilename);
  const image = sharp(filePath).rotate().resize({ width: 1920, withoutEnlargement: true });
  await image.webp({ quality: 82 }).toFile(optimizedPath);
  const metadata = await sharp(optimizedPath).metadata();
  const stats = await fs.stat(optimizedPath);
  await fs.unlink(filePath).catch(() => undefined);
  return {
    filename: optimizedFilename,
    mimeType: "image/webp",
    size: stats.size,
    width: metadata.width,
    height: metadata.height
  };
}

mediaRouter.get(
  "/",
  requirePermission("media:read"),
  asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);
    const query: Record<string, unknown> = {};
    const search = safeSearchRegex(req.query.search);
    if (search) {
      query.$or = [
        { originalName: search },
        { altText: search },
        { folder: search }
      ];
    }
    const folder = safeSlugLike(req.query.folder);
    if (folder) {
      query.folder = folder;
    }
    const [items, total] = await Promise.all([
      MediaModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MediaModel.countDocuments(query)
    ]);
    return ok(res, items, "Operation completed successfully", paginationMeta(page, limit, total));
  })
);

mediaRouter.post(
  "/upload",
  requirePermission("media:create"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return fail(res, 400, "A valid image file is required", "INVALID_UPLOAD");
    }
    const uploadedPath = safeUploadPath(req.file.filename);
    const detectedMimeType = await detectImageMime(uploadedPath);
    if (!detectedMimeType || detectedMimeType !== req.file.mimetype) {
      await fs.unlink(uploadedPath).catch(() => undefined);
      return fail(res, 400, "Uploaded file content does not match an allowed image type", "INVALID_UPLOAD_SIGNATURE");
    }
    const optimized = await optimizeImage(uploadedPath, safeUploadFilename(req.file.filename), detectedMimeType);
    const media = await MediaModel.create({
      filename: optimized.filename,
      originalName: req.file.originalname,
      mimeType: optimized.mimeType,
      size: optimized.size,
      width: optimized.width,
      height: optimized.height,
      folder: safeSlugLike(req.body.folder) || "Library",
      url: `/uploads/${optimized.filename}`,
      altText: req.body.altText || "",
      caption: req.body.caption || "",
      uploadedBy: req.user?.id
    });
    return created(res, media);
  })
);

mediaRouter.get(
  "/:id",
  requirePermission("media:read"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => ok(res, await MediaModel.findById(safeObjectId(req.params.id))))
);

mediaRouter.patch(
  "/:id",
  requirePermission("media:update"),
  validate(idParamSchema, "params"),
  validate(mediaUpdateSchema),
  asyncHandler(async (req, res) => {
    const media = await MediaModel.findById(safeObjectId(req.params.id));
    if (!media) {
      return fail(res, 404, "Media not found", "MEDIA_NOT_FOUND");
    }
    if (typeof req.body.altText === "string") {
      media.altText = req.body.altText;
    }
    if (typeof req.body.caption === "string") {
      media.caption = req.body.caption;
    }
    const folder = safeSlugLike(req.body.folder);
    if (folder) {
      media.folder = folder;
    }
    await media.save();
    return ok(res, media);
  })
);

mediaRouter.delete(
  "/:id",
  requirePermission("media:delete"),
  validate(idParamSchema, "params"),
  asyncHandler(async (req, res) => {
    const media = await MediaModel.findByIdAndDelete(safeObjectId(req.params.id));
    if (media?.filename) {
      await fs.unlink(safeUploadPath(media.filename)).catch(() => undefined);
    }
    return ok(res, {});
  })
);

function safeUploadFilename(filename: string) {
  const basename = path.basename(filename);
  if (!basename || basename !== filename || !/^[a-z0-9][a-z0-9._-]{0,180}$/i.test(basename)) {
    throw Object.assign(new Error("Invalid media filename"), { status: 400 });
  }
  return basename;
}

function safeUploadPath(filename: string) {
  const basename = safeUploadFilename(filename);
  const resolved = path.resolve(uploadRoot, basename);
  if (resolved !== path.join(uploadRoot, basename)) {
    throw Object.assign(new Error("Invalid media path"), { status: 400 });
  }
  return resolved;
}
