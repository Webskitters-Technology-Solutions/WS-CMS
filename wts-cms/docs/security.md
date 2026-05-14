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

# Security

WTS CMS security is API-first and powered by Webskitters Technology Solutions Pvt. Ltd.

Implemented protections include Helmet headers, enforced API CSP, Next.js CSP, production HSTS support, CORS allowlist, trusted-proxy configuration, rate limits, request slow-down, stricter auth limits, HTTP parameter pollution protection, browser-origin checks for mutating requests, MongoDB sanitisation, request size limits, Zod validation, ObjectId validation, password policy, bcrypt hashing, JWT access tokens, refresh-token hashing and rotation, RBAC middleware, audit logs, safe CMS HTML sanitisation, JSON-LD validation, upload MIME allowlisting, upload size limits, immutable upload cache headers, and no stack traces in production.

Admin security additions include session visibility, refresh-session revocation, permission-aware routes for forms, submissions, notifications, and global search, plus frontend security headers in the public and admin Next.js apps. The admin app also emits `X-Robots-Tag: noindex, nofollow`.

RBAC rules protect every admin route. Super Admin owns all permissions. System roles cannot be deleted. Only Super Admin can assign Super Admin. Non-Super Admin users cannot grant permissions they do not have. The last active Super Admin cannot be deleted.

Production checklist: use strong secrets, enable HTTPS, configure HSTS, set `TRUST_PROXY` behind a reverse proxy, pin CORS origins, use secure cookies if switching to cookie auth, back up MongoDB, run `pnpm test:full`, monitor audit logs, and rotate default credentials.

Security verification:

- `pnpm test` checks API security headers and untrusted-origin denial.
- `pnpm test:e2e` checks runtime API headers, readiness, and browser workflows.
- `pnpm headers:check` enforces Webskitters source headers across source files.
