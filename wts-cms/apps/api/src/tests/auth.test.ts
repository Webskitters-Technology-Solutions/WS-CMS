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
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.MONGO_URI = "mongodb://localhost:27017/wts-cms-test";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-long";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-long";
});

describe("WTS CMS JWT authentication", () => {
  it("signs and verifies access tokens", async () => {
    const { signAccessToken, verifyAccessToken } = await import("../middleware/auth.js");
    const token = signAccessToken({ sub: "507f1f77bcf86cd799439011", roleSlug: "super-admin", permissions: ["auth:read"] });
    expect(verifyAccessToken(token).sub).toBe("507f1f77bcf86cd799439011");
  });

  it("signs and verifies refresh tokens", async () => {
    const { signRefreshToken, verifyRefreshToken } = await import("../middleware/auth.js");
    const token = signRefreshToken({ sub: "507f1f77bcf86cd799439011" });
    expect(verifyRefreshToken(token).sub).toBe("507f1f77bcf86cd799439011");
  });
});
