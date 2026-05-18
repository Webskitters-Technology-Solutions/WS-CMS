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
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/JsonLd";
import { BlockRenderer } from "../../../components/BlockRenderer";
import { SafeHtml } from "../../../components/SafeHtml";
import { SocialShare } from "../../../components/SocialShare";
import { apiGet } from "../../../lib/api";
import { toMetadata } from "../../../lib/seo";

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogDetailProps) {
  const { slug } = await params;
  const [blog, settings] = await Promise.all([apiGet<any>(`/api/public/blogs/${slug}`), apiGet<any>("/api/public/settings")]);
  return toMetadata(blog, settings);
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const blog = await apiGet<any>(`/api/public/blogs/${slug}`);
  if (!blog) {
    notFound();
  }
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${blog.permalink}`;
  return (
    <article className="container page blog-detail">
      <JsonLd schemaJson={blog.seo?.schemaJson} />
      <header className="blog-header">
        <span className="section-kicker">WTS CMS article</span>
        <h1>{blog.h1}</h1>
        <p className="meta">{blog.authorName} · {blog.readingTime} min read</p>
        {blog.excerpt ? <p>{blog.excerpt}</p> : null}
      </header>
      {blog.tableOfContents?.length ? (
        <nav className="toc-card">
          {blog.tableOfContents.map((item: any) => <a key={item.anchor} href={`#${item.anchor}`}>{item.text}</a>)}
        </nav>
      ) : null}
      <SafeHtml html={blog.content} />
      <BlockRenderer blocks={blog.blocks} />
      <SocialShare url={url} title={blog.title} />
    </article>
  );
}
