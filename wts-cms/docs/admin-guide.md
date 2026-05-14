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

# Admin Guide

The WTS CMS admin panel is available at `http://localhost:3001` in local development.

## Login

Use the seeded Super Admin account for first access:

```text
Email: admin@webskitters.com
Password: ChangeMe@12345
```

Change the password immediately after first login.

## Dashboard

The dashboard summarizes CMS activity, content totals, publishing activity, admin shortcuts, and platform status.

## Pages

Use Pages to manage CMS pages such as Home, About Us, Contact Us, Gallery, Team, and service pages.

Recommended workflow:

1. Create or edit a page.
2. Set the title, H1, slug, permalink, excerpt, and content.
3. Configure visual blocks where needed.
4. Add featured and banner image alt text.
5. Complete SEO metadata.
6. Preview.
7. Publish.

Changing the slug or parent for a published page creates a redirect from the old permalink.

## Blogs

Use Blog Posts for article content.

Recommended workflow:

1. Create the post.
2. Add title, H1, slug, excerpt, and body content.
3. Assign categories and tags.
4. Add featured image and alt text.
5. Review reading time and table of contents.
6. Configure SEO metadata and schema.
7. Publish.

## SEO Settings

Use SEO fields to manage:

- Search title and description.
- Canonical URL.
- Robots index and follow state.
- Open Graph preview data.
- JSON-LD schema.
- Sitemap eligibility.

## Menus

Menus support nested items, custom links, content references, target behavior, and follow or nofollow link settings.

## Media

Media records include file metadata, alt text, and captions. Alt text should be meaningful and specific because public rendering uses it for accessibility and image SEO.

## Roles And Users

Use Roles to create permission groups. Use Users to assign roles and manage account status.

Important rules:

- Only Super Admin can assign Super Admin.
- System roles cannot be deleted.
- The last active Super Admin cannot be deleted or disabled.
- API authorization remains the source of truth even if admin UI actions are hidden.

## Settings

Site settings control global metadata, GTM, robots.txt, organization schema, locations, social links, and footer content.
