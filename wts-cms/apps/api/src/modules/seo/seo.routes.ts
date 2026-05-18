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
import { BlogModel, CategoryModel, LocationModel, PageModel, SettingsModel, TagModel } from "../../database/models.js";
import { authenticate } from "../../middleware/auth.js";
import { requirePermission } from "../../middleware/rbac.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { ok } from "../../utils/api-response.js";

export const seoRouter = Router();

seoRouter.get(
  "/sitemap-data",
  asyncHandler(async (_req, res) => {
    const settings = await SettingsModel.findOne();
    const visibility = settings?.seoAdminPreferences?.contentVisibility || {};
    const publishedIndexableFilter = { status: "published" as const, "seo.robotsIndex": { $ne: false } };
    const activeIndexableFilter = { status: "active" as const, "seo.robotsIndex": { $ne: false } };
    const [pages, blogs, categories, tags, locations] = await Promise.all([
      visibility.pages === false ? [] : PageModel.find(publishedIndexableFilter).select("permalink updatedAt"),
      visibility.blogs === false ? [] : BlogModel.find(publishedIndexableFilter).select("permalink updatedAt"),
      visibility.categories === false ? [] : CategoryModel.find(activeIndexableFilter).select("slug updatedAt"),
      visibility.tags === false ? [] : TagModel.find(activeIndexableFilter).select("slug updatedAt"),
      visibility.locations === false ? [] : LocationModel.find(publishedIndexableFilter).select("permalink updatedAt")
    ]);
    return ok(res, {
      pages,
      blogs,
      categories: categories.map((item) => ({ permalink: `/blog/category/${item.slug}`, updatedAt: item.updatedAt })),
      tags: tags.map((item) => ({ permalink: `/blog/tag/${item.slug}`, updatedAt: item.updatedAt })),
      locations
    });
  })
);

seoRouter.get(
  "/robots",
  asyncHandler(async (_req, res) => {
    const settings = await SettingsModel.findOne();
    return ok(res, { robotsTxt: settings?.robotsTxt || "User-agent: *\nAllow: /\n" });
  })
);

seoRouter.get(
  "/schema-presets",
  authenticate,
  requirePermission("seo:read"),
  asyncHandler(async (_req, res) =>
    ok(res, {
      WebPage: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: "{{title}}",
        url: "{{url}}",
        description: "{{description}}"
      },
      BlogPosting: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "{{title}}",
        description: "{{description}}",
        author: { "@type": "Organization", name: "Webskitters Technology Solutions Pvt. Ltd." },
        publisher: { "@type": "Organization", name: "Webskitters Technology Solutions Pvt. Ltd." }
      },
      FAQPage: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: []
      },
      BreadcrumbList: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: []
      },
      LocalBusiness: {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "Webskitters Technology Solutions",
        url: "https://www.webskitters.com"
      }
    })
  )
);

seoRouter.get(
  "/audit",
  authenticate,
  requirePermission("seo:read"),
  asyncHandler(async (_req, res) => {
    const [pages, blogs] = await Promise.all([
      PageModel.find({ status: "published" }).select("title permalink content seo updatedAt"),
      BlogModel.find({ status: "published" }).select("title permalink content seo updatedAt")
    ]);
    const knownPaths = new Set([...pages, ...blogs].map((item) => item.permalink));
    const linkedPaths = new Set<string>();
    const brokenInternalLinks: Array<{ source: string; href: string; title: string }> = [];
    const hrefRegex = /href=["']([^"']+)["']/gi;

    for (const item of [...pages, ...blogs]) {
      let match: RegExpExecArray | null;
      while ((match = hrefRegex.exec(item.content || ""))) {
        const href = match[1] || "";
        if (href.startsWith("/") && !href.startsWith("/uploads") && !href.startsWith("/assets")) {
          const path = href.split("#")[0]?.split("?")[0] || "/";
          linkedPaths.add(path);
          if (!knownPaths.has(path)) {
            brokenInternalLinks.push({ source: item.permalink, href, title: item.title });
          }
        }
      }
    }

    return ok(res, {
      brokenInternalLinks,
      orphanPages: pages
        .filter((page) => page.permalink !== "/" && !linkedPaths.has(page.permalink))
        .map((page) => ({ title: page.title, permalink: page.permalink, updatedAt: page.updatedAt })),
      metadataGaps: [...pages, ...blogs]
        .filter((item) => !item.seo?.metaTitle || !item.seo?.metaDescription || item.seo?.robotsIndex === false)
        .map((item) => ({
          title: item.title,
          permalink: item.permalink,
          hasMetaTitle: Boolean(item.seo?.metaTitle),
          hasMetaDescription: Boolean(item.seo?.metaDescription),
          robotsIndex: item.seo?.robotsIndex !== false
        }))
    });
  })
);
