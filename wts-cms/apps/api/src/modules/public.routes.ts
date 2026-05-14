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
import { normalizePath } from "@wts-cms/shared";
import { Router } from "express";
import {
  BlogModel,
  CategoryModel,
  LocationModel,
  MenuModel,
  PageModel,
  PreviewTokenModel,
  RedirectModel,
  TagModel
} from "../database/models.js";
import { publicFormsRouter } from "./forms/forms.routes.js";
import { asyncHandler } from "../utils/async-handler.js";
import { fail, ok } from "../utils/api-response.js";
import { getSettings } from "./settings/settings.routes.js";
import {
  publicBlog,
  publicLocation,
  publicMenu,
  publicPage,
  publicSettings,
  publicTaxonomy
} from "./public.serializers.js";

export const publicRouter = Router();

publicRouter.use("/forms", publicFormsRouter);

function parseMenuLocation(value: unknown): "header" | "footer" | "sidebar" | "custom" | undefined {
  return value === "header" || value === "footer" || value === "sidebar" || value === "custom" ? value : undefined;
}

publicRouter.get("/settings", asyncHandler(async (_req, res) => ok(res, publicSettings(await getSettings()))));

publicRouter.get(
  "/pages/home",
  asyncHandler(async (_req, res) => {
    const page = await PageModel.findOne({ permalink: "/", status: "published" });
    return page ? ok(res, publicPage(page)) : fail(res, 404, "Home page not found", "PAGE_NOT_FOUND");
  })
);

publicRouter.get(
  "/pages/by-path",
  asyncHandler(async (req, res) => {
    const page = await PageModel.findOne({ permalink: normalizePath(String(req.query.path || "/")), status: "published" });
    return page ? ok(res, publicPage(page)) : fail(res, 404, "Page not found", "PAGE_NOT_FOUND");
  })
);

publicRouter.get(
  "/blogs",
  asyncHandler(async (_req, res) => ok(res, (await BlogModel.find({ status: "published" }).sort({ publishedAt: -1 })).map(publicBlog)))
);

publicRouter.get(
  "/blogs/:slug",
  asyncHandler(async (req, res) => {
    const blog = await BlogModel.findOne({ slug: req.params.slug, status: "published" });
    return blog ? ok(res, publicBlog(blog)) : fail(res, 404, "Blog not found", "BLOG_NOT_FOUND");
  })
);

publicRouter.get(
  "/blogs/category/:slug",
  asyncHandler(async (req, res) => {
    const category = await CategoryModel.findOne({ slug: req.params.slug, status: "active" });
    const blogs = category ? await BlogModel.find({ categories: category._id, status: "published" }) : [];
    return category ? ok(res, { category: publicTaxonomy(category, "category"), blogs: blogs.map(publicBlog) }) : fail(res, 404, "Category not found", "CATEGORY_NOT_FOUND");
  })
);

publicRouter.get(
  "/blogs/tag/:slug",
  asyncHandler(async (req, res) => {
    const tag = await TagModel.findOne({ slug: req.params.slug, status: "active" });
    const blogs = tag ? await BlogModel.find({ tags: tag._id, status: "published" }) : [];
    return tag ? ok(res, { tag: publicTaxonomy(tag, "tag"), blogs: blogs.map(publicBlog) }) : fail(res, 404, "Tag not found", "TAG_NOT_FOUND");
  })
);

publicRouter.get(
  "/menus/:location",
  asyncHandler(async (req, res) => {
    const location = parseMenuLocation(req.params.location);
    const menu = location ? await MenuModel.findOne({ location, status: "active" }) : null;
    return ok(res, publicMenu(menu));
  })
);

publicRouter.get(
  "/locations",
  asyncHandler(async (_req, res) => ok(res, (await LocationModel.find({ status: "published" }).sort({ name: 1 })).map(publicLocation)))
);

publicRouter.get(
  "/locations/:slug",
  asyncHandler(async (req, res) => {
    const location = await LocationModel.findOne({ slug: req.params.slug, status: "published" });
    return location ? ok(res, publicLocation(location)) : fail(res, 404, "Location not found", "LOCATION_NOT_FOUND");
  })
);

publicRouter.get(
  "/redirects/resolve",
  asyncHandler(async (req, res) => {
    const source = normalizePath(String(req.query.path || "/"));
    const redirect = await RedirectModel.findOne({ source, isActive: true });
    return ok(res, { redirect });
  })
);

publicRouter.get(
  "/preview/:token",
  asyncHandler(async (req, res) => {
    const preview = await PreviewTokenModel.findOne({ token: req.params.token, expiresAt: { $gt: new Date() } });
    if (!preview) {
      return fail(res, 404, "Preview link expired or not found", "PREVIEW_NOT_FOUND");
    }
    if (preview.entityType === "page") {
      return ok(res, { entityType: "page", entity: publicPage(await PageModel.findById(preview.entityId)) });
    }
    if (preview.entityType === "blog") {
      return ok(res, { entityType: "blog", entity: publicBlog(await BlogModel.findById(preview.entityId)) });
    }
    return ok(res, { entityType: "location", entity: publicLocation(await LocationModel.findById(preview.entityId)) });
  })
);
