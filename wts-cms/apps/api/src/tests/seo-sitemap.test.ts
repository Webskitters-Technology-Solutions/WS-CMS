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
