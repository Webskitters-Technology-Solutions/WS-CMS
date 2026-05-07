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
import { describe, expect, it } from "vitest";
import {
  buildPermalink,
  createSlug,
  isStrongPassword,
  resolveSeo,
  validateJsonLd
} from "@wts-cms/shared";
import { hasPermission } from "../middleware/rbac.js";
import { calculateReadingTime, tableOfContents } from "../utils/content.js";
import { formSchema } from "../validators/cms.js";

describe("WTS CMS core utilities", () => {
  it("generates safe SEO slugs", () => {
    expect(createSlug("Best Web Development Services in Kolkata!")).toBe(
      "best-web-development-services-in-kolkata"
    );
    expect(() => createSlug("api")).toThrow(/reserved/);
  });

  it("builds permalink paths", () => {
    expect(buildPermalink("Web Development", ["Services"])).toBe("/services/web-development");
  });

  it("validates strong passwords", () => {
    expect(isStrongPassword("ChangeMe@12345")).toBe(true);
    expect(isStrongPassword("weak")).toBe(false);
  });

  it("checks RBAC permission keys", () => {
    expect(hasPermission(["pages:read"], "pages:read")).toBe(true);
    expect(hasPermission(["pages:read"], "pages:delete")).toBe(false);
  });

  it("validates dynamic Webskitters form configuration", () => {
    expect(
      formSchema.safeParse({
        name: "Contact US",
        fields: [{ id: "email", label: "Email", type: "email", required: true }],
        status: "active"
      }).success
    ).toBe(true);
  });

  it("resolves SEO fallback metadata", () => {
    const seo = resolveSeo({ title: "About", excerpt: "About WTS CMS", permalink: "/about-us" }, { siteUrl: "https://example.com" });
    expect(seo.metaTitle).toBe("About");
    expect(seo.canonicalUrl).toBe("https://example.com/about-us");
  });

  it("validates JSON-LD before persistence", () => {
    expect(validateJsonLd('{"@context":"https://schema.org","@type":"WebPage"}')).toBe(true);
    expect(validateJsonLd("{broken")).toBe(false);
  });

  it("generates blog reading time and table of contents", () => {
    expect(calculateReadingTime("<p>Hello WTS CMS</p>")).toBe(1);
    expect(tableOfContents("<h2>Intro</h2><h3>Details</h3>")).toEqual([
      { level: 2, text: "Intro", anchor: "intro" },
      { level: 3, text: "Details", anchor: "details" }
    ]);
  });
});
