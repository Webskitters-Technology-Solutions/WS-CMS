<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# API

Base URL: `http://localhost:4000`

System: `GET /health`, `GET /ready`

Auth: `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`, `POST /api/auth/change-password`

Admin resources: `/api/users`, `/api/roles`, `/api/permissions`, `/api/pages`, `/api/blogs`, `/api/categories`, `/api/tags`, `/api/menus`, `/api/media`, `/api/forms`, `/api/forms/submissions`, `/api/redirects`, `/api/locations`, `/api/settings`, `/api/import-export/export`, `/api/import-export/import`, `/api/notifications`, `/api/sessions`, `/api/search`, `/api/audit-logs`

Public resources: `/api/public/settings`, `/api/public/pages/home`, `/api/public/pages/by-path`, `/api/public/blogs`, `/api/public/blogs/:slug`, `/api/public/blogs/category/:slug`, `/api/public/blogs/tag/:slug`, `/api/public/menus/:location`, `/api/public/forms/:slug`, `/api/public/forms/:slug/submit`, `/api/public/locations`, `/api/public/locations/:slug`, `/api/public/redirects/resolve`, `/api/seo/sitemap-data`, `/api/seo/robots`

Authenticated admin routes require `Authorization: Bearer <accessToken>`.

Import/export is protected by settings permissions. `GET /api/import-export/export?resources=pages,blogs,menus` returns portable WTS CMS JSON, and `POST /api/import-export/import` accepts `{ "mode": "upsert", "resources": { "pages": [] } }`.

Responses use:

```json
{ "success": true, "message": "Operation completed successfully", "data": {}, "meta": {} }
```

Errors use:

```json
{ "success": false, "message": "Human-readable error message", "code": "ERROR_CODE", "details": {} }
```
