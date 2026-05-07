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

export function sanitizeCmsHtml(html = ""): string {
  return addHeadingAnchors(sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h2",
      "h3",
      "h4",
      "h5",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "code"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "title"],
      img: ["src", "alt", "width", "height", "loading"],
      "*": ["id"]
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      h1: "h2",
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener" }, true),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }, true)
    }
  }));
}

function addHeadingAnchors(html: string) {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level: string, attributes: string, inner: string) => {
    if (/\sid=/.test(attributes)) {
      return match;
    }
    const text = sanitizeHtml(inner || "", { allowedTags: [], allowedAttributes: {} }).trim();
    const anchor = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    return anchor ? `<h${level}${attributes} id="${anchor}">${inner}</h${level}>` : match;
  });
}

export function calculateReadingTime(html: string): number {
  const words = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).split(/\s+/).filter(Boolean);
  return Math.max(1, Math.ceil(words.length / 220));
}

export function tableOfContents(html: string) {
  const items: { level: 2 | 3; text: string; anchor: string }[] = [];
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(html))) {
    const text = sanitizeHtml(match[2] || "", { allowedTags: [], allowedAttributes: {} }).trim();
    if (text) {
      const anchor = text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
      items.push({ level: Number(match[1]) as 2 | 3, text, anchor });
    }
  }
  return items;
}
