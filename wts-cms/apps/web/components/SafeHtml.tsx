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
import sanitizeHtml from "sanitize-html";

export function SafeHtml({ html }: { html?: string }) {
  const clean = sanitizeHtml(html || "", {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h2", "h3", "h4", "h5", "table", "thead", "tbody", "tr", "th", "td"]),
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt", "width", "height", "loading", "class"],
      "*": ["id", "class"]
    }
  });
  return <div className="prose" dangerouslySetInnerHTML={{ __html: clean }} />;
}
