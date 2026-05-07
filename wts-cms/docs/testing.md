<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Testing

WTS CMS uses layered testing so Webskitters teams can verify API behavior, SEO rules, security headers, admin workflows, and public rendering before handoff.

## Commands

```bash
pnpm headers:check
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
pnpm test:full
```

## API Tests

Vitest covers slug generation, permalink generation, password policy, JWT signing and verification, RBAC permission checks, redirect rules, sitemap noindex filtering, JSON-LD validation, form validation, and security middleware.

Security tests assert:

- CSP is emitted by the Express API.
- `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` are present.
- API responses default to `Cache-Control: no-store`.
- Mutating browser requests from untrusted origins are denied.

## E2E Tests

Playwright runs desktop Chromium and mobile Chromium profiles.

Covered journeys:

- Public homepage render and Webskitters branding.
- Public pages, gallery, contact page, and blog detail visual smoke checks.
- Mobile public layout overflow checks.
- API health, readiness, security headers, and origin-denial behavior.
- Sitemap, robots.txt, canonical metadata, and JSON-LD rendering.
- Admin login.
- Admin dashboard.
- Pages listing and Page Studio editor.
- Import Export admin workflow.
- Mobile admin routes for dashboard, pages, blogs, menus, roles, and SEO settings.

The Playwright config can reuse existing local servers or start the WTS CMS dev stack with `pnpm dev`.

## Test Data

Run `pnpm seed` or `pnpm db:import-demo` before E2E tests. The expected default admin is:

```text
admin@webskitters.com
ChangeMe@12345
```

Change this password immediately in any non-local environment.
