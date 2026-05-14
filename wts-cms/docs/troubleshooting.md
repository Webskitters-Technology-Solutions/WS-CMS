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

# Troubleshooting

Use this guide for common local development issues.

## MongoDB Connection Fails

Check:

- `MONGO_URI` in `.env`.
- MongoDB is running.
- Podman service is healthy if using compose.
- Port `27017` is not blocked or already in use by an unexpected service.

Useful commands:

```bash
pnpm podman:logs
```

## Admin Login Fails

Check:

- Seed data has been created with `pnpm seed`.
- Demo data has been imported with `pnpm db:import-demo`.
- API is running on `http://localhost:4000`.
- `NEXT_PUBLIC_API_BASE_URL` points to the API.
- Browser storage does not contain stale tokens.

## Frequent Logout

Check:

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are stable between restarts.
- API and admin are using the same environment values.
- System time is correct.
- Refresh route is reachable.
- Session was not revoked from the admin panel.

## Public Content Missing

Check:

- Content status is `published`.
- The entity is not marked `noindex` when expecting sitemap output.
- Menus reference valid pages or custom URLs.
- Public API endpoints return data.
- Demo import completed successfully.

## Hydration Error In Next.js

Common causes:

- Date or random values rendered differently on server and client.
- Browser-only code running during server render.
- Invalid HTML nesting.
- Extensions changing HTML before hydration.

Resolve by making the server-rendered markup deterministic and moving browser-only behavior into client effects.

## E2E Tests Fail

Check:

- MongoDB is running.
- Dependencies are installed.
- Playwright browser is installed.
- Ports `3000`, `3001`, and `4000` are available.
- Seed or demo import has completed.

```bash
pnpm exec playwright install chromium
pnpm test:e2e
```
