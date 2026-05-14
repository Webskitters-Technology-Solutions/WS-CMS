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

# WTS CMS Monorepo

WTS CMS is an enterprise-ready, lightweight CMS starter framework powered by Webskitters Technology Solutions Pvt. Ltd. This monorepo contains the API, public website, admin panel, shared packages, Podman infrastructure, seed scripts, tests, and technical documentation.

Repository overview and open-source project files are available in [`../README.md`](../README.md).

## Applications

| App | Path | Port | Purpose |
| --- | --- | --- | --- |
| API | [`apps/api`](./apps/api) | `4000` | Express.js REST API, MongoDB models, auth, RBAC, CMS modules, public API |
| Web | [`apps/web`](./apps/web) | `3000` | Public Next.js website rendered from CMS data |
| Admin | [`apps/admin`](./apps/admin) | `3001` | Next.js CMS admin panel |
| MongoDB | Podman service | `27017` | Local database |

## Packages

| Package | Purpose |
| --- | --- |
| [`packages/shared`](./packages/shared) | Shared types, constants, validators, slug helpers, SEO helpers |
| [`packages/config`](./packages/config) | Shared TypeScript, ESLint, and formatting configuration |
| [`packages/ui`](./packages/ui) | Reusable UI foundation package |

## Quick Start

```bash
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

## Default Admin

```text
Email: admin@webskitters.com
Password: ChangeMe@12345
```

Change this password immediately after first login.

## Core Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Run API, web, and admin |
| `pnpm dev:api` | Run API only |
| `pnpm dev:web` | Run public website only |
| `pnpm dev:admin` | Run admin panel only |
| `pnpm build` | Build all packages and apps |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript checks |
| `pnpm test` | Run API tests |
| `pnpm test:e2e` | Run Playwright tests |
| `pnpm test:full` | Run the full quality gate |
| `pnpm seed` | Seed required CMS data |
| `pnpm db:import-demo` | Import the committed demo database fixture |
| `pnpm db:export-demo` | Export current CMS data to the demo fixture |
| `pnpm headers:check` | Check required Webskitters source headers |

## Podman

```bash
pnpm podman:build
pnpm podman:up
pnpm podman:logs
pnpm podman:down
```

Production compose helpers:

```bash
pnpm podman:prod:up
pnpm podman:prod:down
```

## Environment

Start from [`./.env.example`](./.env.example). App-specific examples are available at:

- [`apps/api/.env.example`](./apps/api/.env.example)
- [`apps/web/.env.example`](./apps/web/.env.example)
- [`apps/admin/.env.example`](./apps/admin/.env.example)

Required production values include MongoDB URI, JWT secrets, CORS origins, public site URL, admin URL, API URL, upload settings, and default super admin credentials for initial seeding.

## Feature Areas

- CMS page management.
- Blog management.
- Categories and tags.
- Menu management.
- Media management.
- Redirect management.
- Settings and SEO management.
- Location pages.
- Forms and submissions.
- Notifications.
- Sessions.
- Global search.
- Users, roles, permissions, and RBAC.
- Audit logs.
- Import and export.
- Database backup and restore.

## Documentation

- [`docs/README.md`](./docs/README.md)
- [`docs/getting-started.md`](./docs/getting-started.md)
- [`docs/configuration.md`](./docs/configuration.md)
- [`docs/architecture.md`](./docs/architecture.md)
- [`docs/api.md`](./docs/api.md)
- [`docs/admin-guide.md`](./docs/admin-guide.md)
- [`docs/content-model.md`](./docs/content-model.md)
- [`docs/security.md`](./docs/security.md)
- [`docs/seo.md`](./docs/seo.md)
- [`docs/rbac.md`](./docs/rbac.md)
- [`docs/backup-restore.md`](./docs/backup-restore.md)
- [`docs/deployment.md`](./docs/deployment.md)
- [`docs/devops.md`](./docs/devops.md)
- [`docs/testing.md`](./docs/testing.md)
- [`docs/performance.md`](./docs/performance.md)
- [`docs/release.md`](./docs/release.md)
- [`docs/troubleshooting.md`](./docs/troubleshooting.md)

## Quality Gate

Run before merging or releasing:

```bash
pnpm test:full
```

The full gate checks source headers, type safety, linting, API tests, builds, and Playwright E2E coverage.

## Open Source Project Files

The repository root includes:

- [`../CONTRIBUTING.md`](../CONTRIBUTING.md)
- [`../CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md)
- [`../SECURITY.md`](../SECURITY.md)
- [`../SUPPORT.md`](../SUPPORT.md)
- [`../CHANGELOG.md`](../CHANGELOG.md)
- [`../MAINTAINERS.md`](../MAINTAINERS.md)
- [`../LICENSE`](../LICENSE)

## Webskitters Credit

WTS CMS is powered by Webskitters Technology Solutions Pvt. Ltd.

[https://www.webskitters.com](https://www.webskitters.com)
