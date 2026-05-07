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
import { notFound } from "next/navigation";
import { JsonLd } from "../../../components/JsonLd";
import { BlockRenderer } from "../../../components/BlockRenderer";
import { SafeHtml } from "../../../components/SafeHtml";
import { SocialShare } from "../../../components/SocialShare";
import { apiGet } from "../../../lib/api";
import { toMetadata } from "../../../lib/seo";

export async function generateMetadata({ params }: any) {
  const [preview, settings] = await Promise.all([
    apiGet<any>(`/api/public/preview/${params.token}`),
    apiGet<any>("/api/public/settings")
  ]);
  return toMetadata(preview?.entity, settings);
}

export default async function PreviewPage({ params }: any) {
  const preview = await apiGet<any>(`/api/public/preview/${params.token}`);
  const entity = preview?.entity;
  if (!entity) {
    notFound();
  }
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${entity.permalink}`;
  return (
    <article className="container page">
      <p className="meta">Private WTS CMS preview powered by Webskitters Technology Solutions Pvt. Ltd.</p>
      <JsonLd schemaJson={entity.seo?.schemaJson} />
      <h1>{entity.h1}</h1>
      {preview.entityType === "blog" ? <p className="meta">{entity.authorName} · {entity.readingTime} min read</p> : null}
      <p className="meta">{entity.excerpt}</p>
      <SafeHtml html={entity.content} />
      <BlockRenderer blocks={entity.blocks} />
      {preview.entityType === "blog" ? <SocialShare url={url} title={entity.title} /> : null}
    </article>
  );
}
