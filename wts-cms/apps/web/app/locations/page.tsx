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
import Link from "next/link";
import { apiGet } from "../../lib/api";
import { toMetadata } from "../../lib/seo";

export async function generateMetadata() {
  const settings = await apiGet<any>("/api/public/settings");
  return toMetadata(
    {
      title: "Webskitters Locations",
      h1: "Webskitters Locations",
      excerpt: "Explore WTS CMS business locations powered by Webskitters Technology Solutions Pvt. Ltd.",
      permalink: "/locations",
      seo: {
        metaTitle: "Webskitters Locations | WTS CMS",
        metaDescription: "Find WTS CMS location pages with LocalBusiness details powered by Webskitters Technology Solutions Pvt. Ltd.",
        canonicalUrl: `${settings?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/locations`,
        robotsIndex: true,
        robotsFollow: true,
        ogType: "website"
      }
    },
    settings
  );
}

export default async function LocationsPage() {
  const locations = (await apiGet<any[]>("/api/public/locations")) || [];
  return (
    <section className="container page">
      <h1>Webskitters Locations</h1>
      <div className="grid">{locations.map((item) => <Link className="card" key={item.id || item.permalink} href={item.permalink}>{item.name}</Link>)}</div>
    </section>
  );
}
