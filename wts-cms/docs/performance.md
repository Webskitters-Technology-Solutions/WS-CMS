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

# Performance

WTS CMS is tuned for small-to-mid Webskitters CMS projects where clean architecture and predictable runtime behavior matter more than heavy platform complexity.

## Implemented Optimisations

- Next.js compression is enabled for the public and admin apps.
- Immutable cache headers are applied to `/_next/static/*` assets.
- Public API and SEO endpoints emit short public cache headers with stale-while-revalidate.
- Private/admin API responses default to `Cache-Control: no-store`.
- Public Next.js data fetches use revalidation.
- Public layouts use responsive CSS grids and content containment for large block sections.
- Images are constrained with responsive sizing and lazy loading.
- Media uploads are optimized to WebP where appropriate.
- API responses use compression above a 1 KB threshold.
- MongoDB indexes cover users, roles, pages, blogs, taxonomy, menus, redirects, media, sessions, forms, and published content queries.
- Playwright checks horizontal overflow on desktop and mobile pages.

## Recommended Production Additions

- Serve uploads from an object store or CDN using the S3-compatible placeholders.
- Add CDN caching for public pages and assets.
- Use production `next start` or a process manager behind HTTPS.
- Configure reverse-proxy gzip or brotli where available.
- Keep MongoDB indexes monitored with `explain()` for custom queries.
- Add synthetic monitoring for `/health`, `/ready`, `/sitemap.xml`, and key public pages.
- Keep images below layout-required dimensions before upload.

## Performance Checklist

- Run `pnpm build`.
- Run `pnpm test:e2e` on desktop and mobile profiles.
- Verify no horizontal overflow.
- Verify sitemap and robots respond quickly.
- Verify public API cache headers.
- Verify admin API responses are not cached.
- Check largest public images and replace oversized uploads before launch.
