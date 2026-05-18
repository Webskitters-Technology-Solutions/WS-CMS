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
import { SafeHtml } from "../../../components/SafeHtml";
import { apiGet } from "../../../lib/api";
import { toMetadata } from "../../../lib/seo";

interface LocationDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: LocationDetailProps) {
  const { slug } = await params;
  const [location, settings] = await Promise.all([apiGet<any>(`/api/public/locations/${slug}`), apiGet<any>("/api/public/settings")]);
  return toMetadata(location, settings);
}

export default async function LocationDetailPage({ params }: LocationDetailProps) {
  const { slug } = await params;
  const location = await apiGet<any>(`/api/public/locations/${slug}`);
  if (!location) {
    notFound();
  }
  return (
    <article className="container page">
      <h1>{location.h1}</h1>
      <p className="meta">{location.address}</p>
      <SafeHtml html={location.content} />
    </article>
  );
}
