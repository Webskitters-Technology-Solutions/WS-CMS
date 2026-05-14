<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Getting Started

This guide helps new developers run WTS CMS locally and understand the first development workflow.

## Requirements

- Node.js 20 or newer.
- Corepack enabled.
- pnpm 10.x.
- MongoDB locally or through Podman.
- Podman and Podman Compose for containerized development.

## Local Setup

```bash
cd wts-cms
corepack enable
pnpm install
cp .env.example .env
pnpm seed
pnpm db:import-demo
pnpm dev
```

## Local URLs

- Public website: `http://localhost:3000`
- Admin panel: `http://localhost:3001`
- API health: `http://localhost:4000/health`
- API readiness: `http://localhost:4000/ready`

## Default Admin

```text
Email: admin@webskitters.com
Password: ChangeMe@12345
```

Change the password after first login.

## First Checks

After startup:

- Visit the public home page.
- Log in to the admin panel.
- Open Pages and confirm seeded pages are listed.
- Open Blog Posts and confirm demo posts are listed.
- Check Settings for site metadata, robots.txt, GTM, and footer content.
- Visit `/sitemap.xml` and `/robots.txt` on the public website.

## Common Development Flow

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Use `pnpm test:full` before opening or merging a pull request.
