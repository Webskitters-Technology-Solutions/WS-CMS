<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

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

Production considerations: run MongoDB with persistent storage and backups, set strong JWT secrets, use HTTPS, configure trusted CORS origins, configure upload storage or object storage placeholders, enable antivirus scanning where required, set GTM only when needed, and change the default Webskitters admin password immediately.
