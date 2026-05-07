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
import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NODE_ENV = "test";
  process.env.MONGO_URI = "mongodb://localhost:27017/wts-cms-test";
  process.env.JWT_ACCESS_SECRET = "test-access-secret-that-is-long";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret-that-is-long";
  process.env.CORS_ORIGINS = "http://localhost:3000,http://localhost:3001";
  process.env.PUBLIC_SITE_URL = "http://localhost:3000";
  process.env.ADMIN_SITE_URL = "http://localhost:3001";
  process.env.API_BASE_URL = "http://localhost:4000";
});

describe("WTS CMS security middleware", () => {
  it("sets strict baseline security headers", async () => {
    const { createApp } = await import("../app.js");
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.headers["content-security-policy"]).toContain("default-src 'self'");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-frame-options"]).toBe("DENY");
    expect(response.headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(response.headers["permissions-policy"]).toContain("camera=()");
    expect(response.headers["cache-control"]).toBe("no-store");
  });

  it("blocks mutating requests from untrusted browser origins", async () => {
    const { createApp } = await import("../app.js");
    const response = await request(createApp())
      .post("/api/auth/login")
      .set("Origin", "https://evil.example")
      .send({ email: "admin@webskitters.com", password: "ChangeMe@12345" })
      .expect(403);

    expect(response.body.code).toBe("ORIGIN_DENIED");
  });
});
