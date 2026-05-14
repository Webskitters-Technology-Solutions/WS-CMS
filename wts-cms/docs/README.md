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

# Documentation

This directory contains the operational and technical documentation for WTS CMS.

## Start Here

- [`../README.md`](../README.md): Monorepo quick start and developer commands.
- [`../../README.md`](../../README.md): Repository overview for open-source users.
- [`getting-started.md`](./getting-started.md): First local setup and verification path.
- [`configuration.md`](./configuration.md): Environment variables and CMS settings.
- [`architecture.md`](./architecture.md): System overview and request flows.
- [`api.md`](./api.md): REST API routes, response format, and auth notes.

## CMS Operations

- [`admin-guide.md`](./admin-guide.md): Admin workflows for pages, blogs, SEO, menus, media, users, and settings.
- [`content-model.md`](./content-model.md): CMS entities, publishing states, SEO subdocuments, URL rules, and visual blocks.
- [`seo.md`](./seo.md): Metadata, sitemap, robots.txt, canonical URLs, schema, GTM, and social previews.
- [`rbac.md`](./rbac.md): Roles, permissions, authorization rules, and admin visibility.
- [`security.md`](./security.md): Security controls, token handling, upload safety, and production checklist.
- [`performance.md`](./performance.md): Implemented optimisations and production speed recommendations.
- [`backup-restore.md`](./backup-restore.md): Demo import/export, backup, restore, and production backup recommendations.

## Engineering And Delivery

- [`deployment.md`](./deployment.md): Environment variables, build commands, Podman commands, and production considerations.
- [`devops.md`](./devops.md): Local quality gates, runtime notes, and operational guidance.
- [`testing.md`](./testing.md): Unit, integration, and E2E test commands and expectations.
- [`release.md`](./release.md): Release checklist, versioning, and release note guidance.
- [`troubleshooting.md`](./troubleshooting.md): Common local issues and fixes.

## Open Source Project Files

The repository root includes:

- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
- [`../../CONTRIBUTORS.md`](../../CONTRIBUTORS.md)
- [`../../CODE_OF_CONDUCT.md`](../../CODE_OF_CONDUCT.md)
- [`../../SECURITY.md`](../../SECURITY.md)
- [`../../SUPPORT.md`](../../SUPPORT.md)
- [`../../CHANGELOG.md`](../../CHANGELOG.md)
- [`../../MAINTAINERS.md`](../../MAINTAINERS.md)
- [`../../LICENSE`](../../LICENSE)

## Documentation Standards

Documentation changes should:

- Keep commands copy-pasteable from the correct working directory.
- Mention security-sensitive defaults clearly.
- Link to related implementation files or docs.
- Preserve Webskitters attribution.
- Avoid documenting secrets, private data, or environment-specific credentials.
