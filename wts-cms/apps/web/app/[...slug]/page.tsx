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
import { notFound, redirect } from "next/navigation";
import { JsonLd } from "../../components/JsonLd";
import { BlockRenderer } from "../../components/BlockRenderer";
import { SafeHtml } from "../../components/SafeHtml";
import { apiGet } from "../../lib/api";
import { toMetadata } from "../../lib/seo";

interface DynamicPageProps {
  params: Promise<{ slug?: string[] }>;
}

async function getPage(params: { slug?: string[] }) {
  const path = `/${(params.slug || []).join("/")}`;
  const resolved = await apiGet<any>(`/api/public/redirects/resolve?path=${encodeURIComponent(path)}`);
  if (resolved?.redirect) {
    redirect(resolved.redirect.destination);
  }
  return apiGet<any>(`/api/public/pages/by-path?path=${encodeURIComponent(path)}`);
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const resolvedParams = await params;
  const [page, settings] = await Promise.all([getPage(resolvedParams), apiGet<any>("/api/public/settings")]);
  return toMetadata(page, settings);
}

export default async function DynamicPage({ params }: DynamicPageProps) {
  const page = await getPage(await params);
  if (!page) {
    notFound();
  }
  return (
    <article className="page page-canvas">
      <JsonLd schemaJson={page.seo?.schemaJson} />
      {page.blocks?.length ? (
        <BlockRenderer blocks={page.blocks} />
      ) : (
        <section className="container page-header">
          <h1>{page.h1}</h1>
          <p>{page.excerpt}</p>
          <SafeHtml html={page.content} />
        </section>
      )}
      {page.blocks?.length && page.content ? (
        <section className="container editorial-section">
          <SafeHtml html={page.content} />
        </section>
      ) : null}
    </article>
  );
}
