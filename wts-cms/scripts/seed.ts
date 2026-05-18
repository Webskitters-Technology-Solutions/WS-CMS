/**
 * ================================================================
 *  __        __ _____ ____  ____  _  _____ _____ _____ _____ ____  ____
 *  \ \      / /| ____| __ )/ ___|| |/ /_ _|_   _|_   _| ____|  _ \/ ___|
 *   \ \ /\ / / |  _| |  _ \\___ \| ' / | |  | |   | | |  _| | |_) \___ \
 *    \ V  V /  | |___| |_) |___) | . \ | |  | |   | | | |___|  _ < ___) |
 *     \_/\_/   |_____|____/|____/|_|\_\___| |_|   |_| |_____|_| \_\____/
 *
 *  Project      : WTS CMS
 *  Powered By   : Webskitters Technology Solutions Pvt. Ltd.
 *  Website      : https://www.webskitters.com
 *  Description  : Enterprise-ready lightweight CMS starter platform
 *
 *  Copyright © Webskitters Technology Solutions Pvt. Ltd.
 * ================================================================
 */
import bcrypt from "bcryptjs";
import { PERMISSION_KEYS, BRAND } from "@wts-cms/shared";
import { env } from "../apps/api/src/config/env.js";
import { connectDatabase, disconnectDatabase } from "../apps/api/src/database/connection.js";
import {
  BlogModel,
  CategoryModel,
  FormModel,
  LocationModel,
  MenuModel,
  PageModel,
  PermissionModel,
  RoleModel,
  SettingsModel,
  TagModel,
  UserModel
} from "../apps/api/src/database/models.js";

const rolePermissionMap = {
  "Super Admin": PERMISSION_KEYS,
  Admin: PERMISSION_KEYS.filter((key) => !["roles:delete", "auditLogs:read"].includes(key)),
  Editor: PERMISSION_KEYS.filter((key) =>
    /^(pages|blogs|categories|tags|menus|media|forms|seo|settings|search|notifications):/.test(key)
  ),
  Author: PERMISSION_KEYS.filter((key) => /^(blogs|media):/.test(key) || key === "auth:read"),
  Viewer: PERMISSION_KEYS.filter((key) => key.endsWith(":read") || key === "auditLogs:read")
};

function systemSlug(input: string) {
  return input.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const demoImages = {
  dashboard: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
  team: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80",
  cms: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
  security: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?auto=format&fit=crop&w=1400&q=80",
  seo: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1400&q=80",
  workflow: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
  galleryOne: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=80",
  galleryTwo: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  galleryThree: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
  galleryFour: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
  galleryFive: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  gallerySix: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80"
};

function demoSeo(title: string, description: string, path: string, ogImage = demoImages.dashboard, ogType = "website") {
  return {
    metaTitle: title,
    metaDescription: description,
    canonicalUrl: `${env.PUBLIC_SITE_URL}${path}`,
    robotsIndex: true,
    robotsFollow: true,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogUrl: `${env.PUBLIC_SITE_URL}${path}`,
    ogType,
    schemaJson: JSON.stringify({
      "@context": "https://schema.org",
      "@type": ogType === "article" ? "BlogPosting" : "WebPage",
      headline: title,
      description,
      publisher: {
        "@type": "Organization",
        name: "Webskitters Technology Solutions Pvt. Ltd.",
        url: BRAND.website
      }
    })
  };
}

function tocFrom(items: Array<{ level: number; text: string; anchor: string }>) {
  return items;
}

async function seed() {
  await connectDatabase();
  await PermissionModel.bulkWrite(
    PERMISSION_KEYS.map((key) => {
      const [resource, action] = key.split(":");
      return {
        updateOne: {
          filter: { key },
          update: {
            $set: {
              key,
              resource,
              action,
              description: `${action} permission for ${resource} in WTS CMS powered by Webskitters.`,
              isSystem: true
            }
          },
          upsert: true
        }
      };
    })
  );

  for (const [name, permissions] of Object.entries(rolePermissionMap)) {
    await RoleModel.findOneAndUpdate(
      { slug: systemSlug(name) },
      {
        name,
        slug: systemSlug(name),
        description: `${name} role for WTS CMS by Webskitters Technology Solutions Pvt. Ltd.`,
        permissions,
        isSystem: true
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  const superAdminRole = await RoleModel.findOne({ slug: "super-admin" });
  await UserModel.findOneAndUpdate(
    { email: env.DEFAULT_SUPER_ADMIN_EMAIL },
    {
      firstName: env.DEFAULT_SUPER_ADMIN_FIRST_NAME,
      lastName: env.DEFAULT_SUPER_ADMIN_LAST_NAME,
      email: env.DEFAULT_SUPER_ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(env.DEFAULT_SUPER_ADMIN_PASSWORD, 12),
      role: superAdminRole?._id,
      status: "active",
      emailVerified: true
    },
    { upsert: true, returnDocument: "after" }
  );

  await SettingsModel.findOneAndUpdate(
    {},
    {
      siteName: BRAND.name,
      siteUrl: env.PUBLIC_SITE_URL,
      defaultMetaTitle: BRAND.defaultTitle,
      defaultMetaDescription: BRAND.defaultDescription,
      gtmContainerId: env.GTM_CONTAINER_ID,
      robotsTxt: "User-agent: *\nAllow: /\nSitemap: http://localhost:3000/sitemap.xml\n",
      organisationSchema: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Webskitters Technology Solutions Pvt. Ltd.",
        url: BRAND.website
      }),
      businessLocations: [
        {
          name: "Webskitters Kolkata",
          addressLine1: "Webskitters Technology Solutions Pvt. Ltd.",
          city: "Kolkata",
          state: "West Bengal",
          country: "India",
          phone: "+91",
          email: "admin@webskitters.com",
          openingHours: "Mo-Fr 10:00-19:00"
        }
      ],
      footerText: "Powered by Webskitters Technology Solutions Pvt. Ltd.",
      poweredByText: "Powered by Webskitters Technology Solutions Pvt. Ltd."
    },
    { upsert: true, returnDocument: "after" }
  );

  const pageSeeds = [
    {
      title: "WTS CMS Home",
      slug: "home",
      permalink: "/",
      h1: "WTS CMS for Fast, Secure Webskitters Projects",
      excerpt: "A lightweight CMS starter with SEO, RBAC, menus, redirects, media, blogs, and admin workflows.",
      featuredImage: demoImages.dashboard,
      featuredImageAlt: "WTS CMS dashboard analytics powered by Webskitters",
      content: `
        <section class="demo-hero">
          <div>
            <span class="demo-kicker">Powered by Webskitters</span>
            <h2>Launch content-managed websites without rebuilding the foundation.</h2>
            <p>WTS CMS gives smaller Webskitters projects a reusable admin, public website, security layer, SEO toolkit, and publishing workflow from day one.</p>
            <div class="demo-actions"><a class="demo-button" href="/about-us">Explore the platform</a><a class="demo-button secondary" href="/blog">Read the blog</a></div>
          </div>
          <img src="${demoImages.dashboard}" alt="WTS CMS analytics dashboard" loading="lazy" />
        </section>
        <section class="demo-stat-grid">
          <div class="demo-stat"><strong>14+</strong><span>Admin modules included</span></div>
          <div class="demo-stat"><strong>SEO</strong><span>Metadata, schema, robots, sitemap, and redirects</span></div>
          <div class="demo-stat"><strong>RBAC</strong><span>Roles and permissions for real editorial teams</span></div>
        </section>
        <h2>What WTS CMS includes</h2>
        <div class="demo-feature-grid">
          <div class="demo-feature"><h3>CMS Pages</h3><p>Create landing pages, service pages, location pages, and structured content with editable SEO.</p></div>
          <div class="demo-feature"><h3>Blog Publishing</h3><p>Manage categories, tags, table of contents, reading time, social sharing, and BlogPosting schema.</p></div>
          <div class="demo-feature"><h3>Secure Admin</h3><p>JWT authentication, permission-aware navigation, rate limiting, audit logs, and Webskitters-branded workflows.</p></div>
        </div>
        <h2>Designed for reusable delivery</h2>
        <p>WTS CMS is intentionally lightweight. It avoids microservices and unnecessary moving parts, while still giving project teams the controls they expect in a production-ready CMS starter.</p>
        <div class="demo-callout">Every demo page here is managed as CMS content and rendered by the public Next.js frontend.</div>
      `,
      blocks: [
        {
          id: "home-cta",
          type: "cta",
          title: "Build the next Webskitters CMS project faster",
          body: "Use WTS CMS as a secure, SEO-ready starter with editable pages, blogs, menus, roles, forms, and redirects."
        }
      ],
      seo: demoSeo(BRAND.defaultTitle, BRAND.defaultDescription, "/", demoImages.dashboard)
    },
    {
      title: "About Us",
      slug: "about-us",
      permalink: "/about-us",
      h1: "About WTS CMS and Webskitters",
      excerpt: "WTS CMS is a reusable content platform by Webskitters Technology Solutions Pvt. Ltd.",
      featuredImage: demoImages.team,
      featuredImageAlt: "Webskitters team planning a WTS CMS project",
      content: `
        <section class="demo-hero">
          <div>
            <span class="demo-kicker">About the platform</span>
            <h2>A practical CMS starter for smaller Webskitters builds.</h2>
            <p>WTS CMS packages the repeatable pieces every content-managed website needs: admin management, public rendering, SEO controls, publishing, media, redirects, and role based access.</p>
          </div>
          <img src="${demoImages.team}" alt="Webskitters team collaborating on CMS planning" loading="lazy" />
        </section>
        <h2>Why it exists</h2>
        <p>Many small and mid-sized website projects need strong fundamentals but do not need a heavyweight enterprise stack. WTS CMS keeps the architecture straightforward so teams can customize quickly and ship confidently.</p>
        <ol class="demo-process">
          <li><strong>Reusable foundation.</strong> Start from a tested monorepo with API, admin, frontend, shared utilities, and Podman local development.</li>
          <li><strong>Content-first delivery.</strong> Editors can manage pages, blogs, menus, redirects, settings, SEO metadata, and media.</li>
          <li><strong>Production-minded controls.</strong> Security middleware, validation, RBAC, audit logs, health checks, and structured logging are already in place.</li>
        </ol>
      `,
      seo: demoSeo("About WTS CMS | Powered by Webskitters", "Learn how WTS CMS helps Webskitters teams launch secure, SEO-ready content websites faster.", "/about-us", demoImages.team)
    },
    {
      title: "Contact Us",
      slug: "contact-us",
      permalink: "/contact-us",
      h1: "Contact Webskitters About WTS CMS",
      excerpt: "Get in touch for WTS CMS demos, implementation planning, and project starter customization.",
      featuredImage: demoImages.workflow,
      featuredImageAlt: "WTS CMS implementation discussion",
      content: `
        <section class="demo-hero">
          <div>
            <span class="demo-kicker">Contact US</span>
            <h2>Plan your next CMS-backed Webskitters project.</h2>
            <p>Use this demo page as a contact landing page pattern. Replace the placeholders with your project phone, email, CRM form, or map embed.</p>
            <div class="demo-actions"><a class="demo-button" href="mailto:admin@webskitters.com">admin@webskitters.com</a><a class="demo-button secondary" href="https://www.webskitters.com">Visit Webskitters</a></div>
          </div>
          <img src="${demoImages.workflow}" alt="WTS CMS project planning session" loading="lazy" />
        </section>
        <div class="demo-contact-grid">
          <div class="demo-contact-card"><h2>Project discovery</h2><p>Discuss pages, blog structure, menus, SEO needs, redirects, and approval workflows.</p></div>
          <div class="demo-contact-card"><h2>Implementation</h2><p>Customize the starter for branding, content types, integrations, analytics, and deployment.</p></div>
          <div class="demo-contact-card"><h2>Support</h2><p>Review admin roles, security settings, launch readiness, and content migration checklists.</p></div>
        </div>
      `,
      blocks: [
        {
          id: "contact-form",
          type: "form",
          title: "Contact Webskitters",
          body: "Submit the database-driven WTS CMS contact form.",
          formSlug: "contact-us"
        }
      ],
      seo: demoSeo("Contact WTS CMS | Powered by Webskitters", "Contact Webskitters Technology Solutions Pvt. Ltd. about WTS CMS implementation and project planning.", "/contact-us", demoImages.workflow)
    },
    {
      title: "Gallery",
      slug: "gallery",
      permalink: "/gallery",
      h1: "WTS CMS Gallery",
      excerpt: "A visual demo gallery showing CMS pages, editorial workflows, analytics, and Webskitters delivery patterns.",
      featuredImage: demoImages.galleryOne,
      featuredImageAlt: "WTS CMS office gallery",
      content: `
        <span class="demo-kicker">Galary demo</span>
        <h2>Visual sections for project storytelling</h2>
        <p>This gallery page demonstrates responsive image grids for case studies, office culture, product screenshots, or client project highlights.</p>
        <div class="demo-gallery-grid">
          <img src="${demoImages.galleryOne}" alt="CMS strategy workshop" loading="lazy" />
          <img src="${demoImages.galleryTwo}" alt="Dashboard interface concept" loading="lazy" />
          <img src="${demoImages.galleryThree}" alt="Editorial collaboration space" loading="lazy" />
          <img src="${demoImages.galleryFour}" alt="Webskitters development team" loading="lazy" />
          <img src="${demoImages.galleryFive}" alt="Content planning meeting" loading="lazy" />
          <img src="${demoImages.gallerySix}" alt="Modern CMS workspace" loading="lazy" />
        </div>
      `,
      seo: demoSeo("WTS CMS Gallery | Powered by Webskitters", "Browse a responsive WTS CMS demo gallery with Webskitters project visuals and CMS-ready image layouts.", "/gallery", demoImages.galleryOne)
    },
    {
      title: "Team",
      slug: "team",
      permalink: "/team",
      h1: "WTS CMS Demo Team",
      excerpt: "Meet the example roles behind a Webskitters CMS delivery team.",
      featuredImage: demoImages.team,
      featuredImageAlt: "WTS CMS demo team",
      content: `
        <section class="demo-hero">
          <div>
            <span class="demo-kicker">Team workflow</span>
            <h2>Roles that map to real CMS responsibilities.</h2>
            <p>WTS CMS supports Super Admin, Admin, Editor, Author, and Viewer roles so delivery teams can separate technical control from editorial ownership.</p>
          </div>
          <img src="${demoImages.team}" alt="WTS CMS role based editorial team" loading="lazy" />
        </section>
        <div class="demo-team-grid">
          <div class="demo-person"><img src="${demoImages.galleryFive}" alt="CMS product owner" loading="lazy" /><h2>Product Owner</h2><p>Defines page structure, launch goals, content ownership, and approval expectations.</p></div>
          <div class="demo-person"><img src="${demoImages.galleryFour}" alt="CMS engineer" loading="lazy" /><h2>CMS Engineer</h2><p>Configures modules, validates security, deploys the stack, and extends the starter.</p></div>
          <div class="demo-person"><img src="${demoImages.galleryThree}" alt="SEO editor" loading="lazy" /><h2>SEO Editor</h2><p>Optimizes metadata, headings, schema, internal links, redirects, and content quality.</p></div>
        </div>
      `,
      seo: demoSeo("WTS CMS Team | Powered by Webskitters", "Meet the example Webskitters delivery roles for WTS CMS projects and editorial workflows.", "/team", demoImages.team)
    }
  ];

  const pageBlockMap: Record<string, { content: string; blocks: any[] }> = {
    home: {
      content: "<p>WTS CMS is a reusable Webskitters starter for secure, SEO-ready content websites. The layout above is powered by structured database blocks.</p>",
      blocks: [
        {
          id: "home-hero",
          type: "hero",
          title: "WTS CMS for fast, secure Webskitters launches",
          body: "A reusable CMS starter with SEO controls, RBAC, blogs, menus, redirects, forms, media, and Podman-ready local development.",
          mediaUrl: demoImages.dashboard
        },
        {
          id: "home-capabilities",
          type: "cards",
          title: "Everything small CMS projects need",
          body: "Use database-driven blocks to compose pages while keeping the API as the source of truth.",
          items: [
            { title: "Editorial CMS", body: "Manage pages, blogs, categories, tags, menus, media, and publishing states.", image: demoImages.cms },
            { title: "SEO Toolkit", body: "Control metadata, canonical URLs, JSON-LD, robots, sitemap, social previews, and redirects.", image: demoImages.seo },
            { title: "Secure Admin", body: "Use JWT auth, RBAC, audit logs, validation, security headers, and session controls.", image: demoImages.security }
          ]
        },
        {
          id: "home-cta",
          type: "cta",
          title: "Build the next Webskitters CMS project faster",
          body: "Start with a lightweight architecture that is easy to customize, test, deploy, and hand over to editors."
        }
      ]
    },
    "about-us": {
      content: "<p>WTS CMS gives Webskitters teams a consistent production-minded base without forcing heavyweight enterprise architecture.</p>",
      blocks: [
        {
          id: "about-hero",
          type: "hero",
          title: "A CMS foundation shaped for repeatable delivery",
          body: "WTS CMS packages the delivery patterns Webskitters teams use again and again: secure admin, content workflows, SEO controls, and public rendering.",
          mediaUrl: demoImages.team
        },
        {
          id: "about-method",
          type: "cards",
          title: "How the platform helps",
          items: [
            { title: "Reusable structure", body: "API, admin, web, shared types, docs, and Podman files live in one monorepo." },
            { title: "Content ownership", body: "Editors can update pages, blogs, menus, settings, media, redirects, and SEO fields." },
            { title: "Launch discipline", body: "Validation, logs, health checks, RBAC, and audit records are included from the first commit." }
          ]
        },
        {
          id: "about-faq",
          type: "faq",
          title: "Common implementation questions",
          items: [
            { title: "Is this a page builder?", body: "It is a CMS starter with structured blocks, so teams can build reusable layouts without losing API control." },
            { title: "Can it be customized?", body: "Yes. The stack is intentionally simple: Express, MongoDB, Mongoose, Next.js, and TypeScript." }
          ]
        }
      ]
    },
    "contact-us": {
      content: "<p>The contact page demonstrates a backend-managed form rendered through the public WTS CMS frontend.</p>",
      blocks: [
        {
          id: "contact-hero",
          type: "hero",
          title: "Plan a WTS CMS-powered project",
          body: "Use the database-driven contact form to capture CMS enquiries, implementation questions, and project discovery requests.",
          mediaUrl: demoImages.workflow
        },
        {
          id: "contact-options",
          type: "cards",
          title: "What Webskitters can help with",
          items: [
            { title: "Project discovery", body: "Define pages, content workflows, SEO goals, redirects, media, and launch requirements." },
            { title: "Implementation", body: "Customize modules, blocks, admin screens, styling, and deployment configuration." },
            { title: "Launch support", body: "Review credentials, RBAC, sitemap, robots, health checks, and production settings." }
          ]
        },
        {
          id: "contact-form",
          type: "form",
          title: "Contact Webskitters",
          body: "Submit the database-driven WTS CMS contact form.",
          formSlug: "contact-us"
        }
      ]
    },
    gallery: {
      content: "<p>This gallery is rendered from structured image block data and can be edited from the WTS CMS admin.</p>",
      blocks: [
        {
          id: "gallery-hero",
          type: "hero",
          title: "A visual CMS gallery for project storytelling",
          body: "Use gallery blocks for project highlights, interface previews, team moments, and content-rich landing pages.",
          mediaUrl: demoImages.galleryOne
        },
        {
          id: "gallery-grid",
          type: "gallery",
          title: "WTS CMS visual blocks",
          body: "Responsive image sections powered by Webskitters CMS data.",
          items: [
            { title: "CMS strategy workshop", image: demoImages.galleryOne },
            { title: "Dashboard interface concept", image: demoImages.galleryTwo },
            { title: "Editorial collaboration space", image: demoImages.galleryThree },
            { title: "Webskitters development team", image: demoImages.galleryFour },
            { title: "Content planning meeting", image: demoImages.galleryFive },
            { title: "Modern CMS workspace", image: demoImages.gallerySix }
          ]
        }
      ]
    },
    team: {
      content: "<p>The team page uses card blocks to explain the roles involved in a Webskitters CMS delivery workflow.</p>",
      blocks: [
        {
          id: "team-hero",
          type: "hero",
          title: "Teams, roles, and responsibilities in WTS CMS",
          body: "Map project delivery and editorial ownership to practical CMS roles, from Super Admin to Viewer.",
          mediaUrl: demoImages.team
        },
        {
          id: "team-cards",
          type: "cards",
          title: "Example CMS delivery roles",
          items: [
            { title: "Product Owner", body: "Defines structure, launch goals, approval expectations, and content ownership.", image: demoImages.galleryFive },
            { title: "CMS Engineer", body: "Configures modules, validates security, extends the starter, and supports deployment.", image: demoImages.galleryFour },
            { title: "SEO Editor", body: "Optimizes metadata, headings, schema, internal links, redirects, and content quality.", image: demoImages.galleryThree }
          ]
        }
      ]
    }
  };

  const normalizeDemoBlocks = (blocks: any[]) =>
    blocks.map((block) => ({
      schemaVersion: 1,
      ...block,
      items: Array.isArray(block.items)
        ? block.items.map((item: any) => ({
            ...item,
            imageAlt: item.imageAlt || item.title || block.title || "WTS CMS visual content"
          }))
        : block.items
    }));

  const pagesBySlug: Record<string, any> = {};
  await PageModel.deleteMany({ permalink: { $in: ["/home", "/untitled-page"] } });
  for (const page of pageSeeds) {
    const blockPage = pageBlockMap[page.slug];
    pagesBySlug[page.slug] = await PageModel.findOneAndUpdate(
      { permalink: page.permalink },
      {
        ...page,
        ...(blockPage ? { ...blockPage, blocks: normalizeDemoBlocks(blockPage.blocks) } : {}),
        status: "published",
        publishedAt: new Date(),
        template: page.slug === "home" ? "home" : "default"
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  const categories = {
    cms: await CategoryModel.findOneAndUpdate(
      { slug: "cms" },
      {
        name: "CMS",
        slug: "cms",
        description: "WTS CMS platform guidance by Webskitters.",
        status: "active",
        seo: demoSeo("CMS Articles | WTS CMS", "CMS strategy and implementation posts for WTS CMS powered by Webskitters.", "/blog/category/cms")
      },
      { upsert: true, returnDocument: "after" }
    ),
    seo: await CategoryModel.findOneAndUpdate(
      { slug: "seo" },
      {
        name: "SEO",
        slug: "seo",
        description: "SEO, schema, sitemap, and content optimization guidance.",
        status: "active",
        seo: demoSeo("SEO Articles | WTS CMS", "SEO best practices for WTS CMS websites powered by Webskitters.", "/blog/category/seo", demoImages.seo)
      },
      { upsert: true, returnDocument: "after" }
    ),
    security: await CategoryModel.findOneAndUpdate(
      { slug: "security" },
      {
        name: "Security",
        slug: "security",
        description: "Security, RBAC, admin hardening, and production readiness.",
        status: "active",
        seo: demoSeo("Security Articles | WTS CMS", "Security guidance for WTS CMS administration and deployments.", "/blog/category/security", demoImages.security)
      },
      { upsert: true, returnDocument: "after" }
    )
  };
  const tags = {
    webskitters: await TagModel.findOneAndUpdate(
      { slug: "webskitters" },
      { name: "Webskitters", slug: "webskitters", description: "Webskitters powered content.", status: "active" },
      { upsert: true, returnDocument: "after" }
    ),
    rbac: await TagModel.findOneAndUpdate(
      { slug: "rbac" },
      { name: "RBAC", slug: "rbac", description: "Role based access control notes.", status: "active" },
      { upsert: true, returnDocument: "after" }
    ),
    seo: await TagModel.findOneAndUpdate(
      { slug: "seo" },
      { name: "SEO", slug: "seo", description: "Search optimization notes.", status: "active" },
      { upsert: true, returnDocument: "after" }
    )
  };

  const blogSeeds = [
    ["welcome-to-wts-cms", "Welcome to WTS CMS", "A guided tour of the Webskitters-powered CMS starter and the problems it solves.", demoImages.cms, categories.cms._id, [tags.webskitters._id]],
    ["why-small-projects-need-a-real-cms-foundation", "Why Small Projects Need a Real CMS Foundation", "Smaller websites still need clean publishing, SEO, roles, and redirects from day one.", demoImages.workflow, categories.cms._id, [tags.webskitters._id]],
    ["seo-checklist-for-wts-cms-launches", "SEO Checklist for WTS CMS Launches", "A practical launch checklist for metadata, schema, canonical tags, robots, and sitemap coverage.", demoImages.seo, categories.seo._id, [tags.seo._id]],
    ["rbac-that-editors-can-understand", "RBAC That Editors Can Understand", "How WTS CMS maps permissions to real editorial responsibilities without making the UI confusing.", demoImages.security, categories.security._id, [tags.rbac._id]],
    ["building-menus-that-scale-with-content", "Building Menus That Scale With Content", "Design navigation structures for headers, footers, sidebars, and campaign pages.", demoImages.galleryOne, categories.cms._id, [tags.webskitters._id]],
    ["content-workflows-for-webskitters-teams", "Content Workflows for Webskitters Teams", "A repeatable page, blog, review, and publish workflow for Webskitters delivery teams.", demoImages.team, categories.cms._id, [tags.webskitters._id]],
    ["redirects-and-slug-changes-without-seo-loss", "Redirects and Slug Changes Without SEO Loss", "Use WTS CMS redirects to protect rankings when published URLs change.", demoImages.seo, categories.seo._id, [tags.seo._id]],
    ["production-readiness-for-a-lightweight-cms", "Production Readiness for a Lightweight CMS", "Health checks, logs, validation, upload controls, and Podman local development in WTS CMS.", demoImages.security, categories.security._id, [tags.rbac._id, tags.webskitters._id]]
  ] as const;

  for (const [slug, title, excerpt, image, categoryId, tagIds] of blogSeeds) {
    const anchorOne = "platform-context";
    const anchorTwo = "webskitters-workflow";
    const content = `
      <img class="demo-wide-image" src="${image}" alt="${title}" loading="lazy" />
      <h2 id="${anchorOne}">Platform context</h2>
      <p>${excerpt} WTS CMS keeps the core stack simple: Express, MongoDB, Next.js, strict TypeScript, and a reusable admin experience.</p>
      <p>For Webskitters teams, this means faster project starts, fewer repeated setup decisions, and a consistent pattern for SEO, security, media, redirects, and roles.</p>
      <h2 id="${anchorTwo}">Webskitters workflow</h2>
      <p>The recommended workflow is to model the content first, assign the right RBAC permissions, prepare SEO metadata, review public rendering, and then publish with confidence.</p>
      <ul><li>Keep URLs lowercase, descriptive, and redirect-safe.</li><li>Write one editable H1 and use H2/H3 sections in content.</li><li>Add image alt text and schema when the page deserves rich search context.</li></ul>
      <div class="demo-callout">Powered by Webskitters Technology Solutions Pvt. Ltd. This demo article is ready to edit from the WTS CMS admin.</div>
    `;
    await BlogModel.findOneAndUpdate(
      { slug },
      {
        title,
        slug,
        permalink: `/blog/${slug}`,
        h1: title,
        excerpt,
        content,
        blocks: normalizeDemoBlocks([
          {
            id: `${slug}-cta`,
            type: "cta",
            title: "Use this article in a real WTS CMS workflow",
            body: "Editors can update this article, SEO metadata, social preview, schema, and supporting blocks from the Webskitters admin.",
            mediaUrl: image
          },
          {
            id: `${slug}-faq`,
            type: "faq",
            title: "Editorial checks before publishing",
            items: [
              { title: "Is the URL clean?", body: "Use lowercase descriptive slugs and keep published URL changes protected with redirects." },
              { title: "Is SEO complete?", body: "Review title length, meta description, canonical URL, JSON-LD, noindex settings, and image alt text." }
            ]
          }
        ]),
        status: "published",
        authorName: "Webskitters Editorial Team",
        featuredImage: image,
        featuredImageAlt: title,
        publishedAt: new Date(Date.now() - blogSeeds.findIndex((blog) => blog[0] === slug) * 86400000),
        readingTime: 3,
        tableOfContents: tocFrom([
          { level: 2, text: "Platform context", anchor: anchorOne },
          { level: 2, text: "Webskitters workflow", anchor: anchorTwo }
        ]),
        categories: [categoryId],
        tags: tagIds,
        seo: demoSeo(`${title} | WTS CMS`, excerpt, `/blog/${slug}`, image, "article")
      },
      { upsert: true, returnDocument: "after" }
    );
  }

  await MenuModel.findOneAndUpdate(
    { slug: "header-menu" },
    {
      name: "Header Menu",
      slug: "header-menu",
      location: "header",
      status: "active",
      items: [
        { id: "home", label: "Home", type: "page", referenceId: pagesBySlug.home._id, url: "/", target: "self", rel: "follow", order: 1 },
        { id: "about", label: "About", type: "page", referenceId: pagesBySlug["about-us"]._id, url: "/about-us", target: "self", rel: "follow", order: 2 },
        { id: "team", label: "Team", type: "page", referenceId: pagesBySlug.team._id, url: "/team", target: "self", rel: "follow", order: 3 },
        { id: "gallery", label: "Gallery", type: "page", referenceId: pagesBySlug.gallery._id, url: "/gallery", target: "self", rel: "follow", order: 4 },
        { id: "blog", label: "Blog", type: "custom", url: "/blog", target: "self", rel: "follow", order: 5 },
        { id: "contact", label: "Contact", type: "page", referenceId: pagesBySlug["contact-us"]._id, url: "/contact-us", target: "self", rel: "follow", order: 6 }
      ]
    },
    { upsert: true, returnDocument: "after" }
  );

  await FormModel.findOneAndUpdate(
    { slug: "contact-us" },
    {
      name: "Contact US",
      slug: "contact-us",
      description: "Default WTS CMS contact form powered by Webskitters.",
      status: "active",
      notificationEmail: "admin@webskitters.com",
      successMessage: "Thank you for contacting Webskitters. The WTS CMS demo team has received your message.",
      honeypotField: "companyWebsite",
      fields: [
        { id: "name", label: "Name", type: "text", required: true, placeholder: "Your name" },
        { id: "email", label: "Email", type: "email", required: true, placeholder: "you@example.com" },
        { id: "phone", label: "Phone", type: "phone", required: false, placeholder: "Optional phone number" },
        { id: "message", label: "Message", type: "textarea", required: true, placeholder: "Tell us about your CMS project" }
      ]
    },
    { upsert: true, returnDocument: "after" }
  );

  await MenuModel.findOneAndUpdate(
    { slug: "footer-menu" },
    {
      name: "Footer Menu",
      slug: "footer-menu",
      location: "footer",
      status: "active",
      items: [
        { id: "home", label: "Home", type: "page", referenceId: pagesBySlug.home._id, url: "/", target: "self", rel: "follow", order: 1 },
        { id: "about", label: "About Us", type: "page", referenceId: pagesBySlug["about-us"]._id, url: "/about-us", target: "self", rel: "follow", order: 2 },
        { id: "gallery", label: "Gallery", type: "page", referenceId: pagesBySlug.gallery._id, url: "/gallery", target: "self", rel: "follow", order: 3 },
        { id: "contact", label: "Contact US", type: "page", referenceId: pagesBySlug["contact-us"]._id, url: "/contact-us", target: "self", rel: "follow", order: 4 },
        { id: "locations", label: "Locations", type: "custom", url: "/locations", target: "self", rel: "follow", order: 5 }
      ]
    },
    { upsert: true, returnDocument: "after" }
  );

  await LocationModel.findOneAndUpdate(
    { slug: "kolkata" },
    {
      name: "Kolkata",
      slug: "kolkata",
      permalink: "/locations/kolkata",
      h1: "Webskitters Kolkata",
      excerpt: "Sample Webskitters business location for WTS CMS.",
      content: "<h2>Webskitters Technology Solutions Pvt. Ltd.</h2><p>Sample LocalBusiness page.</p>",
      address: "Kolkata, West Bengal, India",
      status: "published"
    },
    { upsert: true, returnDocument: "after" }
  );

  await disconnectDatabase();
  process.stdout.write("WTS CMS seed complete. Change admin@webskitters.com / ChangeMe@12345 immediately.\n");
}

void seed().catch(async (error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  await disconnectDatabase();
  process.exit(1);
});
