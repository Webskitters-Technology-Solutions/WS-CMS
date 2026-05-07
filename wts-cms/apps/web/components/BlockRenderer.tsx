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
import { FormRenderer } from "./FormRenderer";

interface VisualBlock {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  mediaUrl?: string;
  formSlug?: string;
  items?: Array<{ title?: string; body?: string; image?: string }>;
}

export function BlockRenderer({ blocks }: { blocks?: VisualBlock[] }) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className="block-stack">
      {blocks.map((block, index) => {
        const key = block.id || `${block.type}-${index}`;
        if (block.type === "form") {
          return <FormRenderer key={key} slug={block.formSlug || "contact-us"} />;
        }
        if (block.type === "gallery") {
          return (
            <section className="visual-block gallery-block" key={key}>
              <h2>{block.title}</h2>
              {block.body ? <p>{block.body}</p> : null}
              <div className="visual-gallery">
                {(block.items?.length ? block.items : [{ image: block.mediaUrl, title: block.title }]).map((item, itemIndex) =>
                  item.image ? <img key={`${key}-${itemIndex}`} src={item.image} alt={item.title || block.title || "WTS CMS gallery image"} loading="lazy" /> : null
                )}
              </div>
            </section>
          );
        }
        if (block.type === "faq") {
          return (
            <section className="visual-block" key={key}>
              <h2>{block.title}</h2>
              {block.body ? <p>{block.body}</p> : null}
              {(block.items || []).map((item, itemIndex) => (
                <details key={`${key}-${itemIndex}`}>
                  <summary>{item.title || "WTS CMS question"}</summary>
                  <p>{item.body || "Answer managed by Webskitters."}</p>
                </details>
              ))}
            </section>
          );
        }
        return (
          <section className={`visual-block ${block.type || "content"}-block`} key={key}>
            {block.mediaUrl ? <img src={block.mediaUrl} alt={block.title || "WTS CMS visual block"} loading="lazy" /> : null}
            <div>
              <h2>{block.title}</h2>
              {block.body ? <p>{block.body}</p> : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
