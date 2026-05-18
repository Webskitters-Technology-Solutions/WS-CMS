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
"use client";

export function SocialShare({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  return (
    <div className="share-row" aria-label="Share article">
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}>Facebook</a>
      <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}>X/Twitter</a>
      <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}>LinkedIn</a>
      <a href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}>WhatsApp</a>
      <button type="button" onClick={() => void navigator.clipboard?.writeText(url)}>Copy link</button>
    </div>
  );
}
