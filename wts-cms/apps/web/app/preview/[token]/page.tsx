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

interface PreviewPageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: PreviewPageProps) {
  const { token } = await params;
  const [preview, settings] = await Promise.all([
    apiGet<any>(`/api/public/preview/${token}`),
    apiGet<any>("/api/public/settings")
  ]);
  return toMetadata(preview?.entity, settings);
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { token } = await params;
  const preview = await apiGet<any>(`/api/public/preview/${token}`);
  const entity = preview?.entity;
  if (!entity) {
    notFound();
  }
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${entity.permalink}`;
  return (
    <article className="page page-canvas">
      <section className="container preview-ribbon">
        Private WTS CMS preview powered by Webskitters Technology Solutions Pvt. Ltd.
      </section>
      <JsonLd schemaJson={entity.seo?.schemaJson} />
      {entity.blocks?.length ? (
        <BlockRenderer blocks={entity.blocks} />
      ) : (
        <section className="container page-header">
          <h1>{entity.h1}</h1>
          {preview.entityType === "blog" ? <p className="meta">{entity.authorName} · {entity.readingTime} min read</p> : null}
          <p>{entity.excerpt}</p>
          <SafeHtml html={entity.content} />
        </section>
      )}
      {entity.blocks?.length && entity.content ? (
        <section className="container editorial-section">
          <SafeHtml html={entity.content} />
        </section>
      ) : null}
      {preview.entityType === "blog" ? (
        <section className="container">
          <SocialShare url={url} title={entity.title} />
        </section>
      ) : null}
    </article>
  );
}
