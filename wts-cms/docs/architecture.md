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

# Architecture

WTS CMS is a pnpm monorepo powered by Webskitters Technology Solutions Pvt. Ltd.

The API owns authentication, authorisation, validation, persistence, redirects, sitemap data, robots data, forms, submissions, notifications, global search, and public CMS content. The public web app renders CMS pages, visual blocks, forms, and SEO metadata with Next.js App Router. The admin app provides protected management screens for content, users, roles, menus, media, forms, redirects, locations, SEO, settings, sessions, notifications, search, and audit logs.

Request flow: browser or admin client calls the API, middleware adds request IDs, security headers, rate limits, CORS checks, validation, authentication, RBAC, controller logic, Mongoose persistence, audit logging, and standard JSON responses.

Auth flow: login verifies bcrypt password, issues short-lived JWT access token and refresh token, stores hashed refresh token, rotates refresh tokens on refresh, and clears refresh tokens on logout.

Public rendering flow: Next.js route fetches entity and settings, resolves SEO fallback metadata, injects JSON-LD in the head, sanitises CMS HTML, renders structured blocks, renders database-driven forms, renders menus, and shows Webskitters footer credit.
