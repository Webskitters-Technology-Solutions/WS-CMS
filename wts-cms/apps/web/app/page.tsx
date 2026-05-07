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
import { JsonLd } from "../components/JsonLd";
import { BlockRenderer } from "../components/BlockRenderer";
import { SafeHtml } from "../components/SafeHtml";
import { apiGet } from "../lib/api";
import { toMetadata } from "../lib/seo";

export async function generateMetadata() {
  const [page, settings] = await Promise.all([apiGet<any>("/api/public/pages/home"), apiGet<any>("/api/public/settings")]);
  return toMetadata(page, settings);
}

export default async function HomePage() {
  const page = await apiGet<any>("/api/public/pages/home");
  if (!page) {
    return (
      <section className="container hero">
        <h1>WTS CMS</h1>
        <p>Powered by Webskitters Technology Solutions Pvt. Ltd.</p>
      </section>
    );
  }
  return (
    <article className="container page">
      <JsonLd schemaJson={page.seo?.schemaJson} />
      <h1>{page.h1}</h1>
      <p className="meta">{page.excerpt}</p>
      <SafeHtml html={page.content} />
      <BlockRenderer blocks={page.blocks} />
    </article>
  );
}
