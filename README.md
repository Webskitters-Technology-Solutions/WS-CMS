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

# WTS CMS

WTS CMS is an enterprise-ready, lightweight CMS starter framework for Webskitters projects and small-to-medium production websites that need strong SEO, secure administration, database-driven content, reusable page blocks, role-based access control, redirects, menus, media, forms, audit logs, and Podman-based local development.

Powered by **Webskitters Technology Solutions Pvt. Ltd.**

Website: [https://www.webskitters.com](https://www.webskitters.com)

## Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Applications](#applications)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Default Access](#default-access)
- [Development Commands](#development-commands)
- [Podman Development](#podman-development)
- [Demo Database](#demo-database)
- [Security](#security)
- [SEO](#seo)
- [RBAC](#rbac)
- [Testing And Quality Gates](#testing-and-quality-gates)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Production Checklist](#production-checklist)
- [License And Release Notes](#license-and-release-notes)

## Overview

WTS CMS is a monorepo framework with a Node.js API, a public Next.js website, and a Next.js admin panel. It is designed as a reusable foundation for CMS-driven marketing sites, corporate websites, blog platforms, location pages, lead forms, and SEO-focused content projects.

The production starter monorepo lives in [`wts-cms`](./wts-cms).

Core goals:

- Keep the platform simple enough for small projects.
- Provide the enterprise basics expected in production CMS work.
- Make every public page database-driven and editable from the admin panel.
- Support SEO workflows without relying on external CMS plugins.
- Provide a predictable local development workflow with pnpm and Podman.
- Preserve Webskitters branding and credit across docs, metadata, seed data, admin, website, and runtime responses.

## Key Features

### Content Management

- Database-driven pages, blogs, categories, tags, menus, locations, redirects, forms, settings, and media.
- Visual content block renderer for public pages.
- Quill-based rich text editor in the admin panel.
- HTML source mode for advanced editing.
- SEO metadata tabs for content entities.
- Draft, publish, schedule, archive, and delete flows.
- Slug and permalink generation.
- Automatic redirect creation when published URLs change.
- CMS-managed home, about, contact, gallery, team, location, and blog content.

### Admin Experience

- Protected admin dashboard.
- Responsive admin layout with accordion navigation.
- Role-aware sidebar items.
- Permission-aware actions.
- Page and blog workspaces with listing, search, filters, create, edit, publish, archive, and preview flows.
- Media picker and alt text management.
- Menu builder.
- Dynamic role and permission management.
- Settings area for site metadata, robots.txt, GTM, organization schema, social links, footer text, and business locations.
- Global admin search.
- Import and export workflows for CMS data.
- Audit log viewer.

### Public Website

- Next.js App Router public frontend.
- Server-side metadata generation.
- Dynamic CMS routes.
- Dynamic blog listing and blog details.
- Dynamic category and tag pages.
- Dynamic location hub and location detail pages.
- Database-driven menus and footer.
- Sitemap and robots.txt routes.
- Redirect handling.
- JSON-LD injection in the document head.
- Social sharing controls.
- Responsive, block-driven page design.

### API Platform

- Express.js API with TypeScript strict mode.
- MongoDB and Mongoose models.
- Zod request validation.
- Standard API response envelope.
- Health and readiness endpoints.
- Request ID middleware.
- Structured request and error logging.
- Central error handling.
- Pagination helpers.
- RBAC middleware.
- Upload validation.
- Audit logging for administrative actions.
- Seed, backup, restore, demo import, and demo export scripts.

## Technology Stack

- **Package management:** pnpm workspaces
- **Runtime:** Node.js
- **Language:** TypeScript strict mode
- **API:** Express.js
- **Database:** MongoDB with Mongoose
- **Public app:** Next.js App Router, React
- **Admin app:** Next.js App Router, React, AdminMart Modernize-inspired layout
- **Editor:** Quill
- **Validation:** Zod
- **Security:** Helmet, CORS allowlist, rate limiting, slow down, Mongo sanitisation, HPP, safe HTML sanitisation
- **Authentication:** JWT access and refresh tokens, bcrypt password hashing
- **Logging:** Pino
- **Testing:** Vitest and Playwright
- **Containers:** Podman and Podman Compose

## Repository Structure

```text
.
├── README.md
└── wts-cms/
    ├── apps/
    │   ├── api/
    │   ├── web/
    │   └── admin/
    ├── packages/
    │   ├── shared/
    │   ├── config/
    │   └── ui/
    ├── database/
    │   └── mongodb/
    ├── docs/
    ├── infra/
    │   └── podman/
    ├── scripts/
    ├── tests/
    ├── package.json
    └── pnpm-workspace.yaml
```

## Applications

| App | Path | Port | Purpose |
| --- | --- | --- | --- |
| API | [`wts-cms/apps/api`](./wts-cms/apps/api) | `4000` | REST API, auth, CMS modules, public API, health checks |
| Web | [`wts-cms/apps/web`](./wts-cms/apps/web) | `3000` | Public database-driven website |
| Admin | [`wts-cms/apps/admin`](./wts-cms/apps/admin) | `3001` | CMS admin panel |
| MongoDB | Podman service | `27017` | Local database |

## Quick Start

Requirements:

- Node.js 20 or newer
- pnpm through Corepack
- MongoDB locally or through Podman
- Podman and Podman Compose for containerized development

Install and run locally:

```bash
cd wts-cms
corepack enable
pnpm install
cp .env.example .env
pnpm seed
pnpm db:import-demo
pnpm dev
```

Open:

- Public website: [http://localhost:3000](http://localhost:3000)
- Admin panel: [http://localhost:3001](http://localhost:3001)
- API health: [http://localhost:4000/health](http://localhost:4000/health)
- API readiness: [http://localhost:4000/ready](http://localhost:4000/ready)

## Environment Configuration

The root environment example is [`wts-cms/.env.example`](./wts-cms/.env.example).

Important variables:

```text
NODE_ENV=development
API_PORT=4000
WEB_PORT=3000
ADMIN_PORT=3001
MONGO_URI=mongodb://mongo:27017/wts-cms
JWT_ACCESS_SECRET=replace-with-strong-access-secret
JWT_REFRESH_SECRET=replace-with-strong-refresh-secret
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
PUBLIC_SITE_URL=http://localhost:3000
ADMIN_SITE_URL=http://localhost:3001
API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_BRAND_NAME=WTS CMS
NEXT_PUBLIC_POWERED_BY=Webskitters
```

Application-specific examples are also provided:

- [`wts-cms/apps/api/.env.example`](./wts-cms/apps/api/.env.example)
- [`wts-cms/apps/web/.env.example`](./wts-cms/apps/web/.env.example)
- [`wts-cms/apps/admin/.env.example`](./wts-cms/apps/admin/.env.example)

Never commit real secrets. Rotate credentials before production use.

## Default Access

The seed script creates the default Super Admin user:

```text
Email: admin@webskitters.com
Password: ChangeMe@12345
```

Change this password immediately after first login.

## Development Commands

Run commands from `wts-cms/`.

| Command | Description |
| --- | --- |
| `pnpm dev` | Run API, web, and admin apps in parallel |
| `pnpm dev:api` | Run only the API |
| `pnpm dev:web` | Run only the public website |
| `pnpm dev:admin` | Run only the admin panel |
| `pnpm build` | Build packages and all applications |
| `pnpm build:api` | Build API |
| `pnpm build:web` | Build public website |
| `pnpm build:admin` | Build admin panel |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fixes |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run API unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm test:full` | Run headers, typecheck, lint, tests, build, and E2E |
| `pnpm seed` | Seed roles, permissions, settings, pages, blogs, menus, forms, and users |
| `pnpm db:import-demo` | Import committed demo database fixture |
| `pnpm db:export-demo` | Export current database into the demo fixture |
| `pnpm backup` | Create a database backup |
| `pnpm restore` | Restore a database backup |
| `pnpm headers:check` | Verify source files include required Webskitters headers |
| `pnpm clean` | Remove generated build artifacts |

## Podman Development

Start the local stack:

```bash
cd wts-cms
pnpm podman:build
pnpm podman:up
pnpm podman:logs
```

Stop the local stack:

```bash
pnpm podman:down
```

Production-oriented compose helpers:

```bash
pnpm podman:prod:up
pnpm podman:prod:down
```

Podman files:

- [`wts-cms/infra/podman/podman-compose.yml`](./wts-cms/infra/podman/podman-compose.yml)
- [`wts-cms/infra/podman/podman-compose.prod.yml`](./wts-cms/infra/podman/podman-compose.prod.yml)
- [`wts-cms/apps/api/Containerfile`](./wts-cms/apps/api/Containerfile)
- [`wts-cms/apps/web/Containerfile`](./wts-cms/apps/web/Containerfile)
- [`wts-cms/apps/admin/Containerfile`](./wts-cms/apps/admin/Containerfile)

## Demo Database

The repository includes a portable MongoDB fixture:

[`wts-cms/database/mongodb/wts-cms-demo-database.json`](./wts-cms/database/mongodb/wts-cms-demo-database.json)

Import it with:

```bash
cd wts-cms
pnpm db:import-demo
```

The demo database includes:

- Super Admin, system roles, and permissions.
- Site settings and Webskitters-branded footer content.
- Header and footer menus.
- Home, About Us, Contact Us, Gallery, Team, and location pages.
- Blog categories, tags, and multiple sample blog posts.
- Forms and submissions.
- SEO metadata, Open Graph data, JSON-LD examples, redirects, and visual content blocks.

## Security

Implemented controls include:

- Helmet security headers.
- CSP-ready structure.
- CORS allowlist.
- Rate limiting for all routes.
- Stricter auth route limits.
- Request slow-down protection.
- Body size limits.
- HTTP parameter pollution protection.
- MongoDB query sanitisation.
- Zod validation.
- ObjectId validation.
- Safe HTML sanitisation for CMS content.
- Password hashing with bcrypt.
- JWT access and refresh token flow.
- Session revocation support.
- RBAC middleware.
- Privilege escalation guards.
- Last Super Admin protection.
- Upload MIME and size validation.
- Image processing support.
- JSON-LD validation before storage.
- Audit logs for critical admin actions.
- Request IDs and structured logs.
- Production-safe error responses.

See [`wts-cms/docs/security.md`](./wts-cms/docs/security.md).

## SEO

SEO capabilities include:

- Editable meta title and meta description.
- Canonical URL management.
- Robots index and follow controls.
- Open Graph title, description, image, URL, and type.
- JSON-LD schema validation and head injection.
- Dynamic sitemap.
- Editable robots.txt.
- GTM container configuration.
- Breadcrumb metadata support.
- Blog reading time and table of contents.
- Category and tag landing pages.
- Location pages with LocalBusiness schema.
- Noindex exclusion from sitemap.
- Social sharing controls.
- URL rules for lowercase, hyphenated, indexable paths.

See [`wts-cms/docs/seo.md`](./wts-cms/docs/seo.md).

## RBAC

Default system roles:

- Super Admin
- Admin
- Editor
- Author
- Viewer

The permission model uses resource-action keys such as:

```text
pages:create
pages:read
pages:update
pages:delete
pages:publish
settings:update
auditLogs:read
```

Rules enforced by the platform:

- Super Admin has all permissions.
- System roles cannot be deleted.
- Only Super Admin can assign Super Admin.
- Non-Super Admin users cannot grant permissions they do not have.
- API authorization remains the source of truth.
- Admin navigation and actions are hidden when permissions are missing.

See [`wts-cms/docs/rbac.md`](./wts-cms/docs/rbac.md).

## Testing And Quality Gates

Run the full local quality gate:

```bash
cd wts-cms
pnpm test:full
```

Coverage areas include:

- Slug generation.
- Permalink generation.
- Redirect creation on slug change.
- Password validation.
- Auth login and JWT verification.
- Permission checks.
- RBAC middleware.
- SEO fallback behavior.
- Noindex sitemap exclusion.
- Public page and blog lookup.
- JSON-LD validation.
- Responsive admin and public smoke checks.

See [`wts-cms/docs/testing.md`](./wts-cms/docs/testing.md).

## Deployment

Deployment preparation:

1. Set production environment variables.
2. Replace default credentials.
3. Use strong JWT secrets.
4. Configure allowed CORS origins.
5. Configure public, admin, and API URLs.
6. Configure MongoDB backups and restore drills.
7. Run `pnpm test:full`.
8. Build with `pnpm build`.
9. Run API, web, admin, and MongoDB behind production TLS.
10. Review security headers, sitemap, robots.txt, GTM, and canonical URLs.

See [`wts-cms/docs/deployment.md`](./wts-cms/docs/deployment.md) and [`wts-cms/docs/devops.md`](./wts-cms/docs/devops.md).

## Documentation

| Document | Purpose |
| --- | --- |
| [`wts-cms/docs/README.md`](./wts-cms/docs/README.md) | Documentation index |
| [`wts-cms/docs/getting-started.md`](./wts-cms/docs/getting-started.md) | Local setup and first verification path |
| [`wts-cms/docs/configuration.md`](./wts-cms/docs/configuration.md) | Environment variables and CMS settings |
| [`wts-cms/docs/architecture.md`](./wts-cms/docs/architecture.md) | System overview, request flow, auth flow, rendering flow |
| [`wts-cms/docs/api.md`](./wts-cms/docs/api.md) | Endpoint map and API usage notes |
| [`wts-cms/docs/admin-guide.md`](./wts-cms/docs/admin-guide.md) | Admin workflows for editors and maintainers |
| [`wts-cms/docs/content-model.md`](./wts-cms/docs/content-model.md) | CMS entities, publishing states, URL rules, and visual blocks |
| [`wts-cms/docs/security.md`](./wts-cms/docs/security.md) | Security controls and production checklist |
| [`wts-cms/docs/seo.md`](./wts-cms/docs/seo.md) | SEO, sitemap, robots, canonical, schema, and GTM notes |
| [`wts-cms/docs/rbac.md`](./wts-cms/docs/rbac.md) | Roles, permissions, and authorization model |
| [`wts-cms/docs/backup-restore.md`](./wts-cms/docs/backup-restore.md) | Demo import/export, backup, and restore guidance |
| [`wts-cms/docs/deployment.md`](./wts-cms/docs/deployment.md) | Build and deployment guidance |
| [`wts-cms/docs/devops.md`](./wts-cms/docs/devops.md) | Local operations and runtime notes |
| [`wts-cms/docs/testing.md`](./wts-cms/docs/testing.md) | Unit, integration, and E2E test guidance |
| [`wts-cms/docs/performance.md`](./wts-cms/docs/performance.md) | Performance optimisations and recommendations |
| [`wts-cms/docs/release.md`](./wts-cms/docs/release.md) | Release checklist and versioning guidance |
| [`wts-cms/docs/troubleshooting.md`](./wts-cms/docs/troubleshooting.md) | Common setup and runtime issues |

## Production Checklist

Before launching a project based on WTS CMS:

- Replace all development secrets.
- Change the default Super Admin password.
- Set `NODE_ENV=production`.
- Configure production MongoDB and backups.
- Configure `PUBLIC_SITE_URL`, `ADMIN_SITE_URL`, and `API_BASE_URL`.
- Configure allowed CORS origins.
- Review security headers.
- Verify admin role assignments.
- Review sitemap and robots.txt.
- Confirm canonical URLs.
- Confirm noindex pages are excluded from sitemap.
- Verify Open Graph previews.
- Validate JSON-LD schemas.
- Confirm GTM container ID if used.
- Run `pnpm test:full`.
- Run a production build.
- Review Podman production compose settings.
- Add monitoring, alerting, and log retention for the hosting environment.

## License And Release Notes

WTS CMS is released under the [`MIT License`](./LICENSE).

Open-source project files:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- [`SECURITY.md`](./SECURITY.md)
- [`SUPPORT.md`](./SUPPORT.md)
- [`CHANGELOG.md`](./CHANGELOG.md)
- [`MAINTAINERS.md`](./MAINTAINERS.md)

Before publishing a tagged release:

- Confirm the version number.
- Update [`CHANGELOG.md`](./CHANGELOG.md).
- Run `pnpm test:full`.
- Confirm demo data does not contain private information.
- Review security and deployment documentation.

## Webskitters Credit

WTS CMS is powered by **Webskitters Technology Solutions Pvt. Ltd.**

[https://www.webskitters.com](https://www.webskitters.com)
