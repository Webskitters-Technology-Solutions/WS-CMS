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
const isProduction = process.env.NODE_ENV === "production";
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const apiOrigin = new URL(apiBaseUrl).origin;
const useHttpsHeaders = apiBaseUrl.startsWith("https://");

const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  `connect-src 'self' ${apiOrigin}`,
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'"
];

if (useHttpsHeaders) {
  cspDirectives.push("upgrade-insecure-requests");
}

const csp = cspDirectives.join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  ...(useHttpsHeaders ? [{ key: "Cross-Origin-Opener-Policy", value: "same-origin" }] : []),
  ...(useHttpsHeaders ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains; preload" }] : [])
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  }
};

export default nextConfig;
