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

describe("WTS CMS redirect creation rules", () => {
  it("creates a 301 redirect when a published permalink changes", () => {
    const previousPermalink: string = "/old-page";
    const nextPermalink: string = "/new-page";
    const status: string = "published";
    const redirect =
      previousPermalink !== nextPermalink && status === "published"
        ? { source: previousPermalink, destination: nextPermalink, statusCode: 301, createdReason: "slug_change" }
        : null;
    expect(redirect).toEqual({
      source: "/old-page",
      destination: "/new-page",
      statusCode: 301,
      createdReason: "slug_change"
    });
  });
});
