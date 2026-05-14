<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Configuration

WTS CMS is configured through environment variables and CMS settings stored in MongoDB.

## Environment Files

- Root example: [`.env.example`](../.env.example)
- API example: [`apps/api/.env.example`](../apps/api/.env.example)
- Web example: [`apps/web/.env.example`](../apps/web/.env.example)
- Admin example: [`apps/admin/.env.example`](../apps/admin/.env.example)

## Required Runtime Variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | Runtime mode |
| `API_PORT` | API port |
| `WEB_PORT` | Public website port |
| `ADMIN_PORT` | Admin panel port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `PUBLIC_SITE_URL` | Canonical public site URL |
| `ADMIN_SITE_URL` | Admin app URL |
| `API_BASE_URL` | API URL |
| `NEXT_PUBLIC_API_BASE_URL` | Browser-safe API URL |
| `NEXT_PUBLIC_SITE_URL` | Browser-safe public site URL |

## Production Rules

- Use long random JWT secrets.
- Never expose private secrets through `NEXT_PUBLIC_` variables.
- Set exact CORS origins.
- Set production URLs before generating sitemap and canonical tags.
- Configure `TRUST_PROXY` when the API runs behind a reverse proxy.
- Keep upload size limits conservative.
- Use HTTPS in production.

## CMS Settings

Admin-managed settings include:

- Site name.
- Site URL.
- Default meta title.
- Default meta description.
- Default Open Graph image.
- GTM container ID.
- Robots.txt content.
- Organization schema.
- Business locations.
- Social links.
- Footer text.
- Powered-by text.

CMS settings are available through the public settings endpoint and are used by the public website for metadata, footer rendering, GTM, robots.txt, and SEO fallbacks.
