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
import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "../components/SiteChrome";
import { apiGet } from "../lib/api";

export const metadata: Metadata = {
  title: "WTS CMS | Powered by Webskitters",
  description:
    "WTS CMS is a lightweight, SEO-ready CMS platform powered by Webskitters Technology Solutions Pvt. Ltd.",
  applicationName: "WTS CMS",
  authors: [{ name: "Webskitters Technology Solutions Pvt. Ltd.", url: "https://www.webskitters.com" }]
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await apiGet<{ gtmContainerId?: string }>("/api/public/settings");
  const gtm = settings?.gtmContainerId || process.env.GTM_CONTAINER_ID || "";
  return (
    <html lang="en">
      <head>
        {gtm ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm}');`
            }}
          />
        ) : null}
      </head>
      <body>
        {gtm ? (
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} />
          </noscript>
        ) : null}
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
