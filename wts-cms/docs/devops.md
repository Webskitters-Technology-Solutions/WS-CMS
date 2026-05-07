<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# DevOps

WTS CMS provides Podman Compose services for API, public web, admin, and MongoDB. The API includes health and readiness endpoints, structured Pino logs, request IDs, graceful shutdown, and MongoDB connection retries.

Use `GET /health` for process health and `GET /ready` for MongoDB readiness. Podman labels credit Webskitters Technology Solutions Pvt. Ltd.

## Local Quality Gate

Run the complete Webskitters quality gate before handoff:

```bash
pnpm test:full
```

This runs header checks, typecheck, lint, API tests, production builds, and Playwright E2E tests.

## Runtime Notes

- Set `TRUST_PROXY=1` when running behind a reverse proxy that terminates TLS.
- Keep `CORS_ORIGINS` limited to the public and admin domains.
- Use `/health` for uptime probes and `/ready` for MongoDB-dependent readiness.
- Use production Podman files for reverse-proxy style local rehearsal.
