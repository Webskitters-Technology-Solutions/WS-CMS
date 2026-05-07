<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Security

WTS CMS security is API-first and powered by Webskitters Technology Solutions Pvt. Ltd.

Implemented protections include Helmet headers, production HSTS support, CORS allowlist, rate limits, stricter auth limits, MongoDB sanitisation, request size limits, Zod validation, ObjectId validation, password policy, bcrypt hashing, JWT access tokens, refresh-token hashing and rotation, RBAC middleware, audit logs, safe CMS HTML sanitisation, JSON-LD validation, upload MIME allowlisting, upload size limits, and no stack traces in production.

Admin security additions include session visibility, refresh-session revocation, permission-aware routes for forms, submissions, notifications, and global search, plus frontend security headers in the public and admin Next.js apps.

RBAC rules protect every admin route. Super Admin owns all permissions. System roles cannot be deleted. Only Super Admin can assign Super Admin. Non-Super Admin users cannot grant permissions they do not have. The last active Super Admin cannot be deleted.

Production checklist: use strong secrets, enable HTTPS, configure HSTS, pin CORS origins, use secure cookies if switching to cookie auth, back up MongoDB, run `pnpm headers:check`, monitor audit logs, and rotate default credentials.
