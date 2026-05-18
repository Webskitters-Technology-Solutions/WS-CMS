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
import { BRAND } from "../constants/branding.js";
import type { PublicEntity, SeoFields } from "../types/content.js";

export function validateJsonLd(schemaJson?: string): boolean {
  if (!schemaJson?.trim()) {
    return true;
  }
  try {
    const parsed = JSON.parse(schemaJson);
    return typeof parsed === "object" && parsed !== null;
  } catch {
    return false;
  }
}

export function resolveSeo(
  entity: PublicEntity | undefined,
  settings: { defaultMetaTitle?: string; defaultMetaDescription?: string; siteUrl?: string } = {}
): Required<Pick<SeoFields, "metaTitle" | "metaDescription" | "robotsIndex" | "robotsFollow">> &
  SeoFields {
  const seo = entity?.seo ?? {};
  return {
    metaTitle:
      seo.metaTitle || entity?.title || entity?.h1 || settings.defaultMetaTitle || BRAND.defaultTitle,
    metaDescription:
      seo.metaDescription || entity?.excerpt || settings.defaultMetaDescription || BRAND.defaultDescription,
    canonicalUrl:
      seo.canonicalUrl ||
      (settings.siteUrl && entity?.permalink
        ? `${settings.siteUrl.replace(/\/$/, "")}${entity.permalink}`
        : ""),
    robotsIndex: seo.robotsIndex ?? true,
    robotsFollow: seo.robotsFollow ?? true,
    ogTitle: seo.ogTitle || seo.metaTitle || entity?.title || BRAND.defaultTitle,
    ogDescription: seo.ogDescription || seo.metaDescription || entity?.excerpt || BRAND.defaultDescription,
    ogImage: seo.ogImage || "",
    ogUrl: seo.ogUrl || "",
    ogType: seo.ogType || "website",
    schemaJson: seo.schemaJson || ""
  };
}
