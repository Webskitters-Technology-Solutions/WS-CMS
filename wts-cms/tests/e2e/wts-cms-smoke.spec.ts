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
import { expect, test } from "@playwright/test";

const webUrl = process.env.WTS_E2E_WEB_URL || "http://localhost:3000";
const adminUrl = process.env.WTS_E2E_ADMIN_URL || "http://localhost:3001";
const apiUrl = process.env.WTS_E2E_API_URL || "http://localhost:4000";

async function expectNoHorizontalOverflow(page: any, label: string) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow, `${label} should not have horizontal overflow`).toBe(false);
}

async function login(page: any) {
  await page.goto(`${adminUrl}/login`);
  await page.getByLabel("Email").fill("admin@webskitters.com");
  await page.getByLabel("Password").fill("ChangeMe@12345");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function expectNoCriticalBrowserIssues(page: any, visit: () => Promise<void>) {
  const issues: string[] = [];

  const pageErrorHandler = (error: Error) => {
    issues.push(`pageerror: ${error.message}`);
  };

  const consoleHandler = (message: any) => {
    if (message.type() === "error") {
      issues.push(`console: ${message.text()}`);
    }
  };

  const requestFailedHandler = (request: any) => {
    const url = request.url();
    if (url.includes("/_next/") || url.includes("favicon.ico") || url.includes(".css") || url.includes(".js")) {
      issues.push(`requestfailed: ${url} ${request.failure()?.errorText || ""}`.trim());
    }
  };

  page.on("pageerror", pageErrorHandler);
  page.on("console", consoleHandler);
  page.on("requestfailed", requestFailedHandler);

  try {
    await visit();
    await page.waitForLoadState("networkidle");
    expect(issues, "page should not emit critical console errors or fail core assets").toEqual([]);
  } finally {
    page.off("pageerror", pageErrorHandler);
    page.off("console", consoleHandler);
    page.off("requestfailed", requestFailedHandler);
  }
}

test("public WTS CMS home renders Webskitters content", async ({ page }) => {
  await page.goto(webUrl);
  await expect(page.getByRole("heading", { name: /WTS CMS/i }).first()).toBeVisible();
  await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page, "home");
});

test("admin login page renders Webskitters branding", async ({ page }) => {
  await page.goto(`${adminUrl}/login`);
  await expect(page.getByRole("img", { name: /WTS CMS/i })).toBeVisible();
  await expect(page.getByText(/Webskitters Technology Solutions/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page, "admin login");
});

test("public visual QA covers core WTS CMS content routes", async ({ page }) => {
  for (const path of ["/", "/about-us", "/contact-us", "/gallery", "/team", "/blog/welcome-to-wts-cms"]) {
    await page.goto(`${webUrl}${path}`);
    await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page, path);
    await page.screenshot({ fullPage: true });
  }
});

test("public mobile navigation and block pages stay responsive", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${webUrl}/about-us`);
  await expect(page.getByRole("heading", { name: /CMS foundation/i }).first()).toBeVisible();
  await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page, "mobile about");
  await page.screenshot({ fullPage: true });
});

test("API exposes health, readiness, and security headers", async ({ request }) => {
  const health = await request.get(`${apiUrl}/health`);
  expect(health.ok()).toBe(true);
  expect(health.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(health.headers()["x-content-type-options"]).toBe("nosniff");
  expect(health.headers()["x-frame-options"]).toBe("DENY");
  if (apiUrl.startsWith("https://")) {
    expect(health.headers()["strict-transport-security"]).toBe("max-age=15552000; includeSubDomains; preload");
  }

  const ready = await request.get(`${apiUrl}/ready`);
  expect(ready.ok()).toBe(true);

  const denied = await request.post(`${apiUrl}/api/auth/login`, {
    headers: { Origin: "https://evil.example" },
    data: { email: "admin@webskitters.com", password: "ChangeMe@12345" }
  });
  expect(denied.status()).toBe(403);
});

test("public SEO endpoints and metadata render correctly", async ({ page, request }) => {
  const sitemap = await request.get(`${webUrl}/sitemap.xml`);
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/contact-us");

  const robots = await request.get(`${webUrl}/robots.txt`);
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("User-agent");

  await page.goto(`${webUrl}/blog/welcome-to-wts-cms`);
  await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", /\/blog\/welcome-to-wts-cms/);
  await expect(page.locator("script[type='application/ld+json']").first()).toBeAttached();
  await expectNoHorizontalOverflow(page, "blog detail SEO");
});

test("admin authenticated journey covers dashboard, pages, import export, and editor responsiveness", async ({ page, isMobile }) => {
  test.skip(isMobile, "Mobile authenticated route coverage is handled by the dedicated responsive admin test.");
  await login(page);
  await expect(page.locator("main h1", { hasText: "Dashboard" })).toBeVisible();
  await expectNoHorizontalOverflow(page, "admin dashboard");

  await page.goto(`${adminUrl}/pages`);
  await expect(page.locator("main h1", { hasText: "Pages" })).toBeVisible();
  await expect(page.getByText("Home").first()).toBeVisible();
  await page.getByRole("button", { name: "Edit page" }).first().click();
  await expect(page.getByText(/Page visual studio/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /Exit full screen editor/i })).toBeVisible();
  await expectNoHorizontalOverflow(page, "page editor");

  await page.goto(`${adminUrl}/import-export`);
  await expect(page.locator("main h1", { hasText: "Import Export" })).toBeVisible();
  await page.getByRole("button", { name: /Generate export/i }).click();
  await expect(page.getByText(/Export generated/i)).toBeVisible();
  await expectNoHorizontalOverflow(page, "import export");
});

test("production pages load styled assets without critical runtime errors", async ({ page }) => {
  await expectNoCriticalBrowserIssues(page, async () => {
    await page.goto(`${adminUrl}/login`);
    await expect(page.locator(".login-panel")).toBeVisible();
    await expect(page.locator("link[rel='stylesheet']").first()).toBeAttached();
  });

  await expectNoCriticalBrowserIssues(page, async () => {
    await page.goto(`${webUrl}/team`);
    await expect(page.getByRole("heading", { name: /teams, roles/i }).first()).toBeVisible();
    await expect(page.locator(".site-header")).toBeVisible();
  });
});

test("visual editor supports fullscreen editing, card selection, and device previews", async ({ page, isMobile }) => {
  test.skip(isMobile, "Device preview controls are validated in the desktop visual studio.");

  await login(page);
  await page.goto(`${adminUrl}/pages`);
  await expect(page.locator("main h1", { hasText: "Pages" })).toBeVisible();

  const teamRow = page.locator("tr", { hasText: "Team" }).first();
  await expect(teamRow).toBeVisible();
  await teamRow.getByRole("button", { name: "Edit page" }).click();

  await expect(page).toHaveURL(/\/pages\?edit=/);
  await expect(page.getByText(/Page visual studio/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Page visual studio/i)).toBeVisible();
  const shell = page.locator(".builder-editor-shell");
  await expect(shell).toHaveClass(/is-fullscreen/);
  await expect(page.locator(".builder-canvas-nav")).toBeVisible();
  await expect(page.locator(".builder-canvas-footer")).toBeVisible();

  const workbenchBox = await page.locator(".builder-workbench").boundingBox();
  const viewportHeight = page.viewportSize()?.height || 900;
  expect(workbenchBox?.height || 0, "visual studio should occupy most of the viewport").toBeGreaterThan(viewportHeight * 0.68);
  const studioViewportMetrics = await page.evaluate(() => ({
    bodyHasLockClass: document.body.classList.contains("wts-builder-studio-active"),
    bodyOverflow: getComputedStyle(document.body).overflow,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight
  }));
  expect(studioViewportMetrics.bodyHasLockClass, "visual studio should lock the page behind the editor").toBe(true);
  expect(studioViewportMetrics.bodyOverflow).toBe("hidden");
  expect(studioViewportMetrics.htmlOverflow).toBe("hidden");
  expect(studioViewportMetrics.scrollHeight, "fullscreen studio should not expose the page settings below the editor").toBeLessThanOrEqual(
    studioViewportMetrics.viewportHeight + 4
  );
  const initialCanvasFit = await page.locator(".builder-canvas-wrap").evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth
  }));
  expect(initialCanvasFit.scrollWidth, "desktop canvas should fit within the editor lane without horizontal clipping").toBeLessThanOrEqual(
    initialCanvasFit.clientWidth + 4
  );

  const cardBlock = page.locator(".builder-block-preview", { hasText: "Example CMS delivery roles" }).first();
  await expect(cardBlock).toBeVisible();
  await cardBlock.click();
  await expect(page.locator(".builder-inspector-title h2", { hasText: "Edit Cards" })).toBeVisible();
  await expect(page.locator(".builder-item-card", { hasText: "Product Owner" })).toBeVisible();
  const nestedControlColor = await page.getByRole("button", { name: "Move item up" }).first().evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(nestedControlColor, "nested item controls should use the dark theme background").not.toBe("rgb(255, 255, 255)");

  const visualBlocksPanel = page.getByLabel("Visual blocks and layers");
  const layersButton = page.getByRole("button", { name: "Layers" }).first();
  await layersButton.click();
  await layersButton.click();
  await layersButton.click();
  await expect(visualBlocksPanel.getByRole("button", { name: /Hero section/i })).toBeVisible();
  await expect(page.locator(".builder-layer-list button").first()).toBeVisible();
  await expect(page.locator(".builder-inspector-title h2", { hasText: "Edit Cards" })).toBeVisible();

  await visualBlocksPanel.getByRole("button", { name: /CTA band/i }).click();
  await visualBlocksPanel.getByRole("button", { name: /FAQ list/i }).click();
  await visualBlocksPanel.getByRole("button", { name: /Gallery/i }).click();
  await visualBlocksPanel.getByRole("button", { name: /Form embed/i }).click();
  const canvasMetrics = await page.locator(".builder-canvas-wrap").evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight
  }));
  expect(canvasMetrics.scrollHeight, "visual studio canvas should expose the full page height").toBeGreaterThan(canvasMetrics.clientHeight);

  await page.locator(".builder-canvas-wrap").evaluate((element) => {
    element.scrollTo({ top: element.scrollHeight, behavior: "instant" });
  });
  const scrolledCanvasTop = await page.locator(".builder-canvas-wrap").evaluate((element) => element.scrollTop);
  expect(scrolledCanvasTop, "visual studio canvas should scroll to lower page sections").toBeGreaterThan(0);
  await expect(page.locator(".builder-block-preview").last()).toBeVisible();

  const desktopButton = page.getByRole("button", { name: "Desktop preview" });
  const tabletButton = page.getByRole("button", { name: "Tablet preview" });
  const mobileButton = page.getByRole("button", { name: "Mobile preview" });
  const canvas = page.locator(".builder-canvas");

  await desktopButton.click();
  const desktopWidth = (await canvas.boundingBox())?.width || 0;
  await tabletButton.click();
  await expect(page.locator(".builder-canvas-wrap")).toHaveClass(/device-tablet/);
  const tabletWidth = (await canvas.boundingBox())?.width || 0;
  await mobileButton.click();
  await expect(page.locator(".builder-canvas-wrap")).toHaveClass(/device-mobile/);
  const mobileWidth = (await canvas.boundingBox())?.width || 0;

  expect(desktopWidth).toBeGreaterThan(tabletWidth);
  expect(tabletWidth).toBeGreaterThan(mobileWidth);
  expect(mobileWidth).toBeLessThanOrEqual(410);

  await page.getByRole("button", { name: /Return to page settings/i }).click();
  await expect(shell).not.toHaveClass(/is-fullscreen/);
});

test("blog visual editor keeps edit context after refresh", async ({ page, isMobile }) => {
  test.skip(isMobile, "Editor refresh behavior is covered in the desktop visual studio.");

  await login(page);
  await page.goto(`${adminUrl}/blogs`);
  await expect(page.locator("main h1", { hasText: "Blog Posts" })).toBeVisible();

  const blogRow = page.locator("tbody tr").first();
  await expect(blogRow).toBeVisible();
  await blogRow.getByRole("button", { name: "Edit blog post" }).click();

  await expect(page).toHaveURL(/\/blogs\?edit=/);
  await expect(page.getByText(/Article visual studio/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Article visual studio/i)).toBeVisible();
  await expect(page.locator(".builder-canvas-nav")).toBeVisible();
  await expect(page.locator(".builder-canvas-footer")).toBeVisible();
});

test("admin mobile pages remain usable without horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await login(page);
  for (const path of ["/dashboard", "/pages", "/blogs", "/menus", "/roles", "/seo-settings"]) {
    await page.goto(`${adminUrl}${path}`);
    await expect(page.getByText(/Powered by Webskitters/i).first()).toBeVisible();
    await expectNoHorizontalOverflow(page, `admin mobile ${path}`);
  }
});
