<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# WTS CMS

WTS CMS is an enterprise-ready lightweight CMS starter platform powered by Webskitters Technology Solutions Pvt. Ltd. It is designed for smaller Webskitters projects that need strong SEO, security, admin management, CMS pages, blogs, users, roles, permissions, RBAC, menus, redirects, locations, forms, submissions, notifications, global search, and Podman-based local development.

## Stack

pnpm workspaces, Node.js, TypeScript strict mode, Express.js, MongoDB, Mongoose, Next.js App Router, React, CSS/Tailwind-ready styling, AdminMart Modernize-inspired admin layout, Zod, Helmet, Pino, JWT, bcrypt, Vitest, Podman, and Podman Compose.

## Setup

```bash
cd wts-cms
pnpm install
cp .env.example .env
pnpm seed
pnpm db:import-demo
pnpm dev
```

Default admin credentials:

```text
Email: admin@webskitters.com
Password: ChangeMe@12345
```

Change the default password immediately after first login.

## Ports

- Public web: http://localhost:3000
- Admin: http://localhost:3001
- API: http://localhost:4000
- MongoDB: localhost:27017

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm seed`
- `pnpm db:import-demo`
- `pnpm db:export-demo`
- `pnpm test:e2e`
- `pnpm headers:check`
- `pnpm podman:up`
- `pnpm podman:down`
- `pnpm podman:logs`
- `pnpm podman:build`
- `pnpm podman:prod:up`
- `pnpm podman:prod:down`

## Podman

```bash
pnpm podman:build
pnpm podman:up
pnpm podman:logs
pnpm podman:down
```

## Security Notes

The API includes Helmet, CORS allowlisting, rate limiting, MongoDB sanitisation, strict body limits, Zod validation, JWT access and refresh tokens, bcrypt password hashing, RBAC middleware, upload MIME and size limits, safe CMS HTML sanitisation, audit logs, request IDs, and production-safe error responses.

## SEO Notes

WTS CMS supports editable metadata, canonical URLs, robots index/follow controls, Open Graph fields, JSON-LD validation, dynamic sitemap, editable robots.txt, GTM, semantic headings, blog table of contents, social sharing, location pages, and noindex sitemap exclusion.

## Demo Database

The repository includes a portable MongoDB fixture at `database/mongodb/wts-cms-demo-database.json`. Restore it with `pnpm db:import-demo` to load the committed Webskitters demo content, pages, blogs, menus, settings, users, roles, permissions, forms, and visual content blocks.

## New CMS Features

WTS CMS includes database-driven contact forms, form submissions, admin notifications, session revocation, global admin search, visual content blocks, media folder search, production Podman reverse-proxy files, and Playwright E2E smoke tests.

## Folder Structure

```text
wts-cms/
  apps/api
  apps/web
  apps/admin
  packages/shared
  packages/config
  packages/ui
  infra/podman
  scripts
  docs
```

Powered by Webskitters Technology Solutions Pvt. Ltd.  
https://www.webskitters.com
