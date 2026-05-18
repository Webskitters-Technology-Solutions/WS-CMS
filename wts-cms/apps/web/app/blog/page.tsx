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
      <header className="page-header">
        <span className="section-kicker">Webskitters insights</span>
        <h1>WTS CMS Blog</h1>
        <p>Practical CMS, SEO, RBAC, and content delivery guidance for Webskitters starter projects.</p>
      </header>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <article className="blog-card" key={blog.id || blog.permalink}>
            {blog.featuredImage ? <img src={blog.featuredImage} alt={blog.featuredImageAlt || blog.title} loading="lazy" /> : null}
            <h2><Link href={blog.permalink}>{blog.title}</Link></h2>
            <p className="meta">{blog.authorName} · {blog.readingTime} min read</p>
            <p>{blog.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
