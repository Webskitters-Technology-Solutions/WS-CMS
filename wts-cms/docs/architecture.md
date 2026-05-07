<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Architecture

WTS CMS is a pnpm monorepo powered by Webskitters Technology Solutions Pvt. Ltd.

The API owns authentication, authorisation, validation, persistence, redirects, sitemap data, robots data, and public CMS content. The public web app renders CMS pages and SEO metadata with Next.js App Router. The admin app provides protected management screens for content, users, roles, menus, media, redirects, locations, SEO, settings, and audit logs.

Request flow: browser or admin client calls the API, middleware adds request IDs, security headers, rate limits, CORS checks, validation, authentication, RBAC, controller logic, Mongoose persistence, audit logging, and standard JSON responses.

Auth flow: login verifies bcrypt password, issues short-lived JWT access token and refresh token, stores hashed refresh token, rotates refresh tokens on refresh, and clears refresh tokens on logout.

Public rendering flow: Next.js route fetches entity and settings, resolves SEO fallback metadata, injects JSON-LD in the head, sanitises CMS HTML, renders menus and Webskitters footer credit.
