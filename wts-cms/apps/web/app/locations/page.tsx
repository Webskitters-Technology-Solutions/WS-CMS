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
