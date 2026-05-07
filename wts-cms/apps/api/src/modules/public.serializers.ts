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
function id(value: any) {
  return value?._id?.toString?.() || value?.id || "";
}

function seo(value: any) {
  const seoValue = value?.seo || {};
  return {
    metaTitle: seoValue.metaTitle || "",
    metaDescription: seoValue.metaDescription || "",
    canonicalUrl: seoValue.canonicalUrl || "",
    robotsIndex: seoValue.robotsIndex !== false,
    robotsFollow: seoValue.robotsFollow !== false,
    ogTitle: seoValue.ogTitle || "",
    ogDescription: seoValue.ogDescription || "",
    ogImage: seoValue.ogImage || "",
    ogUrl: seoValue.ogUrl || "",
    ogType: seoValue.ogType || "website",
    schemaJson: seoValue.schemaJson || ""
  };
}

export function publicPage(document: any) {
  if (!document) {
    return null;
  }
  return {
    id: id(document),
    title: document.title,
    slug: document.slug,
    permalink: document.permalink,
    h1: document.h1,
    excerpt: document.excerpt || "",
    content: document.content || "",
    blocks: document.blocks || [],
    template: document.template || "default",
    featuredImage: document.featuredImage || "",
    featuredImageAlt: document.featuredImageAlt || "",
    bannerImage: document.bannerImage || "",
    bannerImageAlt: document.bannerImageAlt || "",
    publishedAt: document.publishedAt,
    updatedAt: document.updatedAt,
    seo: seo(document)
  };
}

export function publicBlog(document: any) {
  if (!document) {
    return null;
  }
  return {
    id: id(document),
    title: document.title,
    slug: document.slug,
    permalink: document.permalink,
    h1: document.h1,
    excerpt: document.excerpt || "",
    content: document.content || "",
    blocks: document.blocks || [],
    authorName: document.authorName || "Webskitters Editorial Team",
    readingTime: document.readingTime || 1,
    featuredImage: document.featuredImage || "",
    featuredImageAlt: document.featuredImageAlt || "",
    categories: document.categories || [],
    tags: document.tags || [],
    tableOfContents: document.tableOfContents || [],
    publishedAt: document.publishedAt,
    updatedAt: document.updatedAt,
    seo: seo(document)
  };
}

export function publicTaxonomy(document: any, type: "category" | "tag") {
  if (!document) {
    return null;
  }
  return {
    id: id(document),
    type,
    name: document.name,
    slug: document.slug,
    permalink: type === "category" ? `/blog/category/${document.slug}` : `/blog/tag/${document.slug}`,
    description: document.description || "",
    updatedAt: document.updatedAt,
    seo: seo(document)
  };
}

export function publicLocation(document: any) {
  if (!document) {
    return null;
  }
  return {
    id: id(document),
    name: document.name,
    slug: document.slug,
    permalink: document.permalink,
    h1: document.h1,
    excerpt: document.excerpt || "",
    content: document.content || "",
    address: document.address || "",
    phone: document.phone || "",
    email: document.email || "",
    latitude: document.latitude,
    longitude: document.longitude,
    updatedAt: document.updatedAt,
    seo: seo(document)
  };
}

export function publicMenu(document: any) {
  if (!document) {
    return null;
  }
  return {
    id: id(document),
    name: document.name,
    slug: document.slug,
    location: document.location,
    items: document.items || []
  };
}

export function publicSettings(document: any) {
  return {
    siteName: document?.siteName || "WTS CMS",
    siteUrl: document?.siteUrl || "http://localhost:3000",
    defaultMetaTitle: document?.defaultMetaTitle || "WTS CMS | Powered by Webskitters",
    defaultMetaDescription:
      document?.defaultMetaDescription ||
      "WTS CMS is a lightweight, SEO-ready CMS platform powered by Webskitters Technology Solutions Pvt. Ltd.",
    defaultOgImage: document?.defaultOgImage || "",
    gtmContainerId: document?.gtmContainerId || "",
    robotsTxt: document?.robotsTxt || "User-agent: *\nAllow: /\n",
    organisationSchema: document?.organisationSchema || "",
    businessLocations: document?.businessLocations || [],
    socialLinks: document?.socialLinks || {},
    footerText: document?.footerText || "Powered by Webskitters Technology Solutions Pvt. Ltd.",
    poweredByText: document?.poweredByText || "Powered by Webskitters Technology Solutions Pvt. Ltd."
  };
}
