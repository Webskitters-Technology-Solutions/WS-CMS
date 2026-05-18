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
import { Router } from "express";
import { BlogModel, MediaModel, PageModel, RedirectModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";

export const searchRouter = Router();

searchRouter.use(authenticate);

searchRouter.get(
  "/",
  requirePermission("search:read"),
  asyncHandler(async (req, res) => {
    const search = String(req.query.q || "").trim();
    if (search.length < 2) {
      return ok(res, []);
    }
    const matcher = { $regex: search, $options: "i" };
    const [pages, blogs, media, redirects] = await Promise.all([
      PageModel.find({ $or: [{ title: matcher }, { h1: matcher }, { permalink: matcher }] }).limit(8).select("title permalink status updatedAt"),
      BlogModel.find({ $or: [{ title: matcher }, { h1: matcher }, { permalink: matcher }] }).limit(8).select("title permalink status updatedAt"),
      MediaModel.find({ $or: [{ originalName: matcher }, { altText: matcher }, { folder: matcher }] }).limit(8).select("originalName url altText folder createdAt"),
      RedirectModel.find({ $or: [{ source: matcher }, { destination: matcher }] }).limit(8).select("source destination statusCode isActive")
    ]);
    return ok(res, [
      ...pages.map((item) => ({ type: "page", title: item.title, url: item.permalink, status: item.status })),
      ...blogs.map((item) => ({ type: "blog", title: item.title, url: item.permalink, status: item.status })),
      ...media.map((item) => ({ type: "media", title: item.originalName, url: item.url, status: item.folder || "Library" })),
      ...redirects.map((item) => ({ type: "redirect", title: item.source, url: item.destination, status: String(item.statusCode) }))
    ]);
  })
);
