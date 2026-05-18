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
import { apiGet } from "../lib/api";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  target?: "self" | "blank";
  rel?: "follow" | "nofollow";
}

export async function SiteChrome({ children }: { children: React.ReactNode }) {
  const [header, footer, settings] = await Promise.all([
    apiGet<{ items: MenuItem[] }>("/api/public/menus/header"),
    apiGet<{ items: MenuItem[] }>("/api/public/menus/footer"),
    apiGet<any>("/api/public/settings")
  ]);
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container nav">
          <Link href="/" className="brand">
            <img src="/ws-cms-logo.png" alt="WTS CMS" className="brand-logo" />
          </Link>
          <nav className="nav-links">
            {(header?.items || []).map((item) => (
              <Link
                key={item.id}
                href={item.url || "/"}
                target={item.target === "blank" ? "_blank" : undefined}
                rel={`${item.rel === "nofollow" ? "nofollow " : ""}${item.target === "blank" ? "noopener noreferrer" : ""}`.trim() || undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container nav">
          <div>{settings?.footerText || "Powered by Webskitters Technology Solutions Pvt. Ltd."}</div>
          <nav className="footer-links">
            {(footer?.items || []).map((item) => (
              <Link
                key={item.id}
                href={item.url || "/"}
                target={item.target === "blank" ? "_blank" : undefined}
                rel={`${item.rel === "nofollow" ? "nofollow " : ""}${item.target === "blank" ? "noopener noreferrer" : ""}`.trim() || undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
