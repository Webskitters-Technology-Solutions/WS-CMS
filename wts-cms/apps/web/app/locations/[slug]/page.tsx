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
import { SafeHtml } from "../../../components/SafeHtml";
import { apiGet } from "../../../lib/api";
import { toMetadata } from "../../../lib/seo";

export async function generateMetadata({ params }: any) {
  const [location, settings] = await Promise.all([apiGet<any>(`/api/public/locations/${params.slug}`), apiGet<any>("/api/public/settings")]);
  return toMetadata(location, settings);
}

export default async function LocationDetailPage({ params }: any) {
  const location = await apiGet<any>(`/api/public/locations/${params.slug}`);
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
