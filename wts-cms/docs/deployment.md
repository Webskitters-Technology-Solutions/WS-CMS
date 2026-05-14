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

# Deployment

Configure environment variables from `.env.example`, install with `pnpm install`, build with `pnpm build`, seed with `pnpm seed` or restore the committed demo database with `pnpm db:import-demo`, and run each app with its package `start` script.

Podman local development:

```bash
pnpm podman:build
pnpm podman:up
pnpm podman:logs
pnpm podman:down
```

Production-style Podman reverse proxy:

```bash
pnpm podman:prod:up
pnpm podman:prod:down
```

Production considerations: run MongoDB with persistent storage and backups, set strong JWT secrets, use HTTPS, configure trusted CORS origins, choose `STORAGE_DRIVER=local` or the S3-compatible placeholder variables (`S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`), enable `AV_SCAN_ENABLED=true` when an antivirus scanner is wired in, set GTM only when needed, and change the default Webskitters admin password immediately.

Content migrations can be handled from Admin > Import Export or through `/api/import-export/export` and `/api/import-export/import`.
