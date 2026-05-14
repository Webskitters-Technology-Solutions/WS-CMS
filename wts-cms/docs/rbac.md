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

# RBAC

System roles: Super Admin, Admin, Editor, Author, Viewer.

Super Admin has all permissions. Admin has broad operational permissions. Editor manages content and SEO. Author manages blog and media content. Viewer receives read-oriented permissions.

Permission resources: auth, users, roles, permissions, pages, blogs, categories, tags, menus, media, redirects, settings, seo, locations, auditLogs.

The API is the source of truth for authorisation. The admin sidebar and actions are hidden based on permissions, but the API still enforces every protected action.
