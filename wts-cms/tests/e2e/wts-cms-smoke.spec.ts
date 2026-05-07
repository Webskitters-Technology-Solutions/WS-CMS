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

test("public visual QA covers core WTS CMS content routes", async ({ page }) => {
  const baseUrl = process.env.WTS_E2E_WEB_URL || "http://localhost:3000";
  for (const path of ["/", "/contact-us", "/gallery", "/blog/welcome-to-wts-cms"]) {
    await page.goto(`${baseUrl}${path}`);
    await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `${path} should not have horizontal overflow`).toBe(false);
    await page.screenshot({ fullPage: true });
  }
});

test("public mobile navigation and block pages stay responsive", async ({ page }) => {
  const baseUrl = process.env.WTS_E2E_WEB_URL || "http://localhost:3000";
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseUrl}/about-us`);
  await expect(page.getByRole("heading", { name: /CMS foundation/i }).first()).toBeVisible();
  await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  await page.screenshot({ fullPage: true });
});
