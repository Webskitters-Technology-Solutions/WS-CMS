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
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 7_500
  },
  use: {
    baseURL: process.env.WTS_E2E_WEB_URL || "http://localhost:3000",
    trace: "on-first-retry"
  },
  webServer: {
    command:
      "MONGO_URI=${MONGO_URI:-mongodb://localhost:27017/wts-cms} JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET:-local-access-secret-change-me-123} JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET:-local-refresh-secret-change-me-123} CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:3000,http://localhost:3001} PUBLIC_SITE_URL=${PUBLIC_SITE_URL:-http://localhost:3000} ADMIN_SITE_URL=${ADMIN_SITE_URL:-http://localhost:3001} API_BASE_URL=${API_BASE_URL:-http://localhost:4000} NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-http://localhost:4000} NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000} corepack pnpm dev",
    url: process.env.WTS_E2E_WEB_URL || "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] }
    }
  ]
});
