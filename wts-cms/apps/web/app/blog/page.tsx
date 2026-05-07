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
import Link from "next/link";
import { apiGet } from "../../lib/api";
import { toMetadata } from "../../lib/seo";

export async function generateMetadata() {
  const settings = await apiGet<any>("/api/public/settings");
  return toMetadata(
    {
      title: "WTS CMS Blog",
      h1: "WTS CMS Blog",
      excerpt: "CMS strategy, SEO, RBAC, and Webskitters implementation guidance.",
      permalink: "/blog",
      seo: {
        metaTitle: "WTS CMS Blog | Powered by Webskitters",
        metaDescription: "Read WTS CMS articles about SEO, RBAC, content operations, and secure Webskitters CMS implementation.",
        canonicalUrl: `${settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/blog`,
        robotsIndex: true,
        robotsFollow: true,
        ogType: "blog"
      }
    },
    settings
  );
}

export default async function BlogListingPage() {
  const blogs = (await apiGet<any[]>("/api/public/blogs")) || [];
  return (
    <section className="container page">
      <h1>WTS CMS Blog</h1>
      <div className="grid">
        {blogs.map((blog) => (
          <article className="card" key={blog.id || blog.permalink}>
            <h2><Link href={blog.permalink}>{blog.title}</Link></h2>
            <p className="meta">{blog.authorName} · {blog.readingTime} min read</p>
            <p>{blog.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
