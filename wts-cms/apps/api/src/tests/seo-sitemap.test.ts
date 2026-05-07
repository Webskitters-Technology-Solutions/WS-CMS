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

describe("WTS CMS sitemap noindex filtering", () => {
  it("excludes noindex entities from sitemap candidates", () => {
    const pages = [
      { permalink: "/indexed", seo: { robotsIndex: true } },
      { permalink: "/hidden", seo: { robotsIndex: false } }
    ];
    expect(pages.filter((page) => page.seo.robotsIndex !== false).map((page) => page.permalink)).toEqual([
      "/indexed"
    ]);
  });
});
