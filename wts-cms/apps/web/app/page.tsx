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
