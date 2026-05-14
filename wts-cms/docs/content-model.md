<!--
===============================================================
WTS CMS
Powered By Webskitters Technology Solutions Pvt. Ltd.
Website: https://www.webskitters.com
===============================================================
-->

# Content Model

WTS CMS stores public website content in MongoDB and exposes it through admin and public API routes.

## Core Entities

| Entity | Purpose |
| --- | --- |
| Pages | CMS-managed public pages with visual blocks, HTML content, hierarchy, SEO, and publishing state |
| Blogs | Blog posts with categories, tags, author data, reading time, table of contents, SEO, and schema |
| Categories | Blog taxonomy landing pages with SEO fields |
| Tags | Blog tag landing pages with SEO fields |
| Menus | Header, footer, sidebar, and custom navigation structures |
| Media | Uploaded images with alt text, captions, MIME metadata, and ownership |
| Redirects | Manual and automatic redirects for URL changes |
| Locations | Location landing pages with LocalBusiness schema support |
| Forms | Public lead forms with configurable fields |
| Submissions | Stored form submissions for admin review |
| Settings | Site-level metadata, robots.txt, GTM, schema, footer, and social links |
| Users | Admin users with roles, status, and session state |
| Roles | Permission groups for RBAC |
| Permissions | Resource-action permission keys |
| Audit Logs | Critical admin action history |

## Publishing States

Content can use these publishing states where supported:

- `draft`
- `published`
- `scheduled`
- `archived`

Only published and indexable content should appear in public listings and sitemap output.

## SEO Subdocument

Indexable entities can define:

- Meta title.
- Meta description.
- Canonical URL.
- Robots index and follow settings.
- Open Graph fields.
- JSON-LD schema.

Fallback order:

1. Entity SEO fields.
2. Generated entity values.
3. Global settings.
4. WTS CMS defaults.

## URL Rules

- URLs are lowercase.
- Words use hyphens.
- Query strings and hash fragments are not used for indexable canonical URLs.
- Reserved paths are blocked.
- Published slug changes generate redirects.

## Visual Blocks

Public pages can be rendered from database-driven visual blocks. Blocks should remain portable and avoid environment-specific hardcoded URLs unless intentionally configured.
