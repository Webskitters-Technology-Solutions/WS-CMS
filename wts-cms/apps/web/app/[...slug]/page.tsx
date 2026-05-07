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
import { SafeHtml } from "../../components/SafeHtml";
import { apiGet } from "../../lib/api";
import { toMetadata } from "../../lib/seo";

async function getPage(params: any) {
  const path = `/${(params.slug || []).join("/")}`;
  const resolved = await apiGet<any>(`/api/public/redirects/resolve?path=${encodeURIComponent(path)}`);
  if (resolved?.redirect) {
    redirect(resolved.redirect.destination);
  }
  return apiGet<any>(`/api/public/pages/by-path?path=${encodeURIComponent(path)}`);
}

export async function generateMetadata({ params }: any) {
  const [page, settings] = await Promise.all([getPage(params), apiGet<any>("/api/public/settings")]);
  return toMetadata(page, settings);
}

export default async function DynamicPage({ params }: any) {
  const page = await getPage(params);
  if (!page) {
    notFound();
  }
  return (
    <article className="container page">
      <JsonLd schemaJson={page.seo?.schemaJson} />
      <h1>{page.h1}</h1>
      <p className="meta">{page.excerpt}</p>
      <SafeHtml html={page.content} />
    </article>
  );
}
