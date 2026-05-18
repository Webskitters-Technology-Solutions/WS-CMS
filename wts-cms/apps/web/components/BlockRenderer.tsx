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
import { FormRenderer } from "./FormRenderer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

interface VisualBlock {
  id?: string;
  type?: string;
  title?: string;
  body?: string;
  mediaUrl?: string;
  formSlug?: string;
  schemaVersion?: number;
  items?: Array<{ title?: string; body?: string; image?: string; imageAlt?: string }>;
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
          return (
            <section className="block-section form-section" key={key}>
              <div className="section-copy">
                <span className="section-kicker">Database form</span>
                <h2>{block.title || "Contact Webskitters"}</h2>
                {block.body ? <p>{block.body}</p> : null}
              </div>
              <FormRenderer slug={block.formSlug || "contact-us"} />
            </section>
          );
        }
        if (block.type === "hero") {
          const imageUrl = resolvePublicAssetUrl(block.mediaUrl);
          return (
            <section className="block-section hero-section" key={key}>
              <div className="hero-copy">
                <span className="section-kicker">Powered by Webskitters</span>
                <h2>{block.title || "WTS CMS"}</h2>
                {block.body ? <p>{block.body}</p> : null}
                <div className="hero-actions">
                  <a href="/contact-us">Start a CMS project</a>
                  <a href="/blog">Read insights</a>
                </div>
              </div>
              {imageUrl ? <img src={imageUrl} alt={block.title || "WTS CMS visual section"} loading="lazy" /> : null}
            </section>
          );
        }
        if (block.type === "cta") {
          const imageUrl = resolvePublicAssetUrl(block.mediaUrl);
          return (
            <section className="block-section cta-section" key={key}>
              <div className="section-copy">
                <span className="section-kicker">Powered by Webskitters</span>
                <h2>{block.title || "Start your WTS CMS project"}</h2>
                {block.body ? <p>{block.body}</p> : null}
                <div className="hero-actions">
                  <a href="/contact-us">Primary action</a>
                </div>
              </div>
              {imageUrl ? <img src={imageUrl} alt={block.title || "WTS CMS call to action"} loading="lazy" /> : null}
            </section>
          );
        }
        if (block.type === "cards") {
          return (
            <section className="block-section cards-section" key={key}>
              <div className="section-copy">
                <span className="section-kicker">CMS blocks</span>
                <h2>{block.title || "WTS CMS capabilities"}</h2>
                {block.body ? <p>{block.body}</p> : null}
              </div>
              <div className="block-card-grid">
                {(block.items?.length ? block.items : [{ title: block.title, body: block.body, image: block.mediaUrl }]).map((item, itemIndex) => (
                  <article className="block-card" key={`${key}-${itemIndex}`}>
                    {resolvePublicAssetUrl(item.image) ? (
                      <img src={resolvePublicAssetUrl(item.image)} alt={item.imageAlt || item.title || "WTS CMS card"} loading="lazy" />
                    ) : null}
                    <h3>{item.title || "WTS CMS feature"}</h3>
                    {item.body ? <p>{item.body}</p> : null}
                  </article>
                ))}
              </div>
            </section>
          );
        }
        if (block.type === "gallery") {
          return (
            <section className="block-section gallery-section" key={key}>
              <div className="section-copy">
                <span className="section-kicker">Visual library</span>
                <h2>{block.title || "WTS CMS gallery"}</h2>
                {block.body ? <p>{block.body}</p> : null}
              </div>
              <div className="visual-gallery">
                {(block.items?.length ? block.items : [{ image: block.mediaUrl, title: block.title }]).map((item, itemIndex) =>
                  resolvePublicAssetUrl(item.image) ? (
                    <figure key={`${key}-${itemIndex}`}>
                      <img src={resolvePublicAssetUrl(item.image)} alt={item.imageAlt || item.title || block.title || "WTS CMS gallery image"} loading="lazy" />
                      {item.title ? <figcaption>{item.title}</figcaption> : null}
                    </figure>
                  ) : null
                )}
              </div>
            </section>
          );
        }
        if (block.type === "faq") {
          return (
            <section className="block-section faq-section" key={key}>
              <div className="section-copy">
                <span className="section-kicker">Helpful answers</span>
                <h2>{block.title || "WTS CMS FAQ"}</h2>
                {block.body ? <p>{block.body}</p> : null}
              </div>
              <div className="faq-list">
                {(block.items || []).map((item, itemIndex) => (
                  <details key={`${key}-${itemIndex}`}>
                    <summary>{item.title || "WTS CMS question"}</summary>
                    <p>{item.body || "Answer managed by Webskitters."}</p>
                  </details>
                ))}
              </div>
            </section>
          );
        }
        return (
          <section className={`block-section ${block.type || "content"}-section`} key={key}>
            <div>
              <span className="section-kicker">WTS CMS</span>
              <h2>{block.title || "WTS CMS section"}</h2>
              {block.body ? <p>{block.body}</p> : null}
            </div>
            {resolvePublicAssetUrl(block.mediaUrl) ? (
              <img src={resolvePublicAssetUrl(block.mediaUrl)} alt={block.title || "WTS CMS visual block"} loading="lazy" />
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

function resolvePublicAssetUrl(value?: string) {
  if (!value) {
    return "";
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  return `${API_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
}
