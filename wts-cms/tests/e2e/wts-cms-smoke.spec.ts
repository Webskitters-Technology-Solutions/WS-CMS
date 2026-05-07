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
import { expect, test } from "@playwright/test";

test("public WTS CMS home renders Webskitters content", async ({ page }) => {
  await page.goto(process.env.WTS_E2E_WEB_URL || "http://localhost:3000");
  await expect(page.getByRole("heading", { name: /WTS CMS/i }).first()).toBeVisible();
  await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
});

test("admin login page renders Webskitters branding", async ({ page }) => {
  await page.goto(process.env.WTS_E2E_ADMIN_URL || "http://localhost:3001/login");
  await expect(page.getByText("WTS CMS").first()).toBeVisible();
  await expect(page.getByText(/Webskitters Technology Solutions/i).first()).toBeVisible();
});
