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
"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Calendar,
  CheckCircle2,
  Copy,
  Eye,
  FileText,
  Globe2,
  Heading2,
  Image,
  LayoutTemplate,
  Lightbulb,
  Link2,
  ListChecks,
  ListPlus,
  Monitor,
  MoreHorizontal,
  PanelRight,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  X
} from "lucide-react";
import { adminApi, hasAdminSession, resolveApiAssetUrl } from "../lib/api";
import { AdminTextEditor } from "./AdminTextEditor";
import { MediaPicker } from "./MediaPicker";
import { VisualHtmlEditorTabs } from "./VisualHtmlEditorTabs";

type PanelKey = "content" | "seo" | "publish" | "media" | "history";
type PublishStatus = "draft" | "pending_review" | "approved" | "published" | "scheduled" | "archived";
type VisualBlockItem = { title?: string; body?: string; image?: string; imageAlt?: string };
type VisualBlock = {
  id: string;
  type: "hero" | "cards" | "cta" | "faq" | "gallery" | "form";
  schemaVersion?: number;
  collapsed?: boolean;
  title?: string;
  body?: string;
  mediaUrl?: string;
  formSlug?: string;
  items?: VisualBlockItem[];
  settings?: {
    align?: "left" | "center" | "right";
    spacing?: string;
    background?: string;
    anchor?: string;
    customClass?: string;
  };
};

export interface EditablePage {
  _id?: string;
  title?: string;
  slug?: string;
  permalink?: string;
  h1?: string;
  excerpt?: string;
  content?: string;
  blocks?: VisualBlock[];
  status?: PublishStatus;
  template?: string;
  order?: number;
  parentPage?: string;
  featuredImageAlt?: string;
  bannerImageAlt?: string;
  publishedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    ogUrl?: string;
    ogType?: "website" | "article" | "blog" | "profile" | "product";
    schemaJson?: string;
  };
}

interface RevisionItem {
  _id: string;
  title?: string;
  reason?: string;
  createdAt?: string;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function plainTextFromHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function isJsonValid(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function isCleanIndexablePath(value: string) {
  return Boolean(value) && !/[?#_\s]/.test(value) && value === value.toLowerCase();
}

function isImageLike(value: string) {
  if (!value.trim()) {
    return false;
  }

  return /^https?:\/\//i.test(value) || /\.(jpe?g|png|webp|gif|svg)(\?.*)?$/i.test(value);
}

function normalizeVisualBlocks(value?: VisualBlock[]) {
  return (value || []).map((block, index) => ({
    ...block,
    schemaVersion: 1,
    id: block.id || `${block.type || "block"}-${Date.now()}-${index}`,
    collapsed: false,
    items: block.items || []
  }));
}

function countInlineImagesWithoutAlt(value: string) {
  return Array.from(value.matchAll(/<img\b[^>]*>/gi)).filter((match) => !/\salt=(["'])[^"']+\1/i.test(match[0])).length;
}

function extractHeadings(value: string) {
  return Array.from(value.matchAll(/<h([2-5])[^>]*>(.*?)<\/h[2-5]>/gi)).map((match) => ({
    level: `H${match[1]}`,
    text: plainTextFromHtml(match[2] || "")
  }));
}

function getKeywordDensity(text: string, keyword: string) {
  if (!keyword.trim()) {
    return 0;
  }
  const words = text.split(/\s+/).filter(Boolean).length || 1;
  const occurrences = (text.toLowerCase().match(new RegExp(keyword.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  return Number(((occurrences / words) * 100).toFixed(2));
}

export function PageEditor({ initialPage, onBack }: { initialPage?: EditablePage | null; onBack?: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPage?.title || "");
  const [slugValue, setSlugValue] = useState(initialPage?.slug || slugify(initialPage?.title || ""));
  const [h1, setH1] = useState(initialPage?.h1 || "");
  const [content, setContent] = useState(initialPage?.content || "");
  const [blocks, setBlocks] = useState<VisualBlock[]>(normalizeVisualBlocks(initialPage?.blocks));
  const [excerpt, setExcerpt] = useState(initialPage?.excerpt || "");
  const [template, setTemplate] = useState(initialPage?.template || "default");
  const [order, setOrder] = useState(String(initialPage?.order ?? 0));
  const [parentPage, setParentPage] = useState(initialPage?.parentPage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialPage?.featuredImageAlt || "");
  const [bannerImageAlt, setBannerImageAlt] = useState(initialPage?.bannerImageAlt || "");
  const [metaTitle, setMetaTitle] = useState(initialPage?.seo?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialPage?.seo?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialPage?.seo?.canonicalUrl || "");
  const [ogTitle, setOgTitle] = useState(initialPage?.seo?.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(initialPage?.seo?.ogDescription || "");
  const [ogImage, setOgImage] = useState(initialPage?.seo?.ogImage || "");
  const [ogUrl, setOgUrl] = useState(initialPage?.seo?.ogUrl || "");
  const [ogType, setOgType] = useState<"website" | "article" | "blog" | "profile" | "product">(initialPage?.seo?.ogType || "website");
  const [focusKeyphrase, setFocusKeyphrase] = useState("");
  const [schemaJson, setSchemaJson] = useState(initialPage?.seo?.schemaJson || "");
  const [robotsIndex, setRobotsIndex] = useState(initialPage?.seo?.robotsIndex !== false);
  const [robotsFollow, setRobotsFollow] = useState(initialPage?.seo?.robotsFollow !== false);
  const [scheduleAt, setScheduleAt] = useState(initialPage?.publishedAt ? initialPage.publishedAt.slice(0, 16) : "");
  const [activePanel, setActivePanel] = useState<PanelKey>("content");
  const [savedId, setSavedId] = useState(initialPage?._id || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [draftPreviewOpen, setDraftPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);

  const slug = useMemo(() => slugify(slugValue || title || "untitled-page"), [slugValue, title]);
  const permalink = useMemo(() => {
    if (savedId && initialPage?.permalink === "/" && slug === "home") {
      return "/";
    }
    return `/${slug}`;
  }, [initialPage?.permalink, savedId, slug]);
  const wordCount = useMemo(() => plainTextFromHtml(content).split(/\s+/).filter(Boolean).length, [content]);
  const readableContent = useMemo(() => plainTextFromHtml(content), [content]);
  const resolvedMetaTitle = metaTitle || title || "WTS CMS | Powered by Webskitters";
  const resolvedMetaDescription =
    metaDescription || excerpt || "WTS CMS is a lightweight, SEO-ready CMS platform powered by Webskitters Technology Solutions Pvt. Ltd.";
  const resolvedCanonicalUrl = canonicalUrl || permalink;
  const resolvedOgTitle = ogTitle || resolvedMetaTitle;
  const resolvedOgDescription = ogDescription || resolvedMetaDescription;
  const resolvedOgUrl = ogUrl || resolvedCanonicalUrl;
  const headingOutline = useMemo(() => extractHeadings(content), [content]);
  const inlineImagesMissingAlt = useMemo(() => countInlineImagesWithoutAlt(content), [content]);
  const blockImagesMissingAlt = useMemo(
    () =>
      blocks.reduce((total, block) => {
        const blockMissing = block.mediaUrl && !bannerImageAlt && block.type !== "form" ? 1 : 0;
        const itemMissing = (block.items || []).filter((item) => item.image && !item.imageAlt).length;
        return total + blockMissing + itemMissing;
      }, 0),
    [bannerImageAlt, blocks]
  );
  const internalLinkCount = useMemo(() => Array.from(content.matchAll(/<a\b[^>]*href=(["'])\/(?!\/)[^"']+\1/gi)).length, [content]);
  const keywordDensity = useMemo(
    () => getKeywordDensity(`${resolvedMetaTitle} ${resolvedMetaDescription} ${h1 || title} ${readableContent}`, focusKeyphrase),
    [focusKeyphrase, h1, readableContent, resolvedMetaDescription, resolvedMetaTitle, title]
  );
  const seoChecks = useMemo(() => {
    return [
      {
        label: "Search title length",
        help: "Recommended length is 50 to 60 characters.",
        done: resolvedMetaTitle.length >= 50 && resolvedMetaTitle.length <= 60
      },
      {
        label: "Meta description",
        help: "Recommended length is 150 to 160 characters.",
        done: resolvedMetaDescription.length >= 150 && resolvedMetaDescription.length <= 160
      },
      {
        label: "Canonical URL",
        help: "Use a self-referencing canonical or an absolute canonical URL.",
        done: Boolean(resolvedCanonicalUrl) && (resolvedCanonicalUrl.startsWith("/") || /^https?:\/\//i.test(resolvedCanonicalUrl))
      },
      {
        label: "Clean indexable URL",
        help: "Keep URLs lowercase with hyphens and no query strings, hashes, spaces, or underscores.",
        done: isCleanIndexablePath(permalink)
      },
      {
        label: "Focus keyphrase in content",
        help: "Mention the focus keyphrase naturally in the page body.",
        done: focusKeyphrase
          ? `${resolvedMetaTitle} ${h1 || title} ${resolvedMetaDescription} ${readableContent}`
              .toLowerCase()
              .includes(focusKeyphrase.toLowerCase())
          : false
      },
      {
        label: "Readable structure",
        help: "Use subheadings and enough body copy for useful context.",
        done: /<h2|<h3/i.test(content) && wordCount >= 120
      },
      {
        label: "Single H1 rule",
        help: "Keep the page H1 in the dedicated field and avoid H1 tags inside the editor.",
        done: !/<h1[\s>]/i.test(content) && Boolean(h1 || title)
      },
      {
        label: "Open Graph title",
        help: "Provide a share title or let it fall back to the SEO title.",
        done: resolvedOgTitle.length > 0 && resolvedOgTitle.length <= 95
      },
      {
        label: "Open Graph description",
        help: "Provide a share description for social previews.",
        done: resolvedOgDescription.length >= 80 && resolvedOgDescription.length <= 200
      },
      {
        label: "Open Graph image",
        help: "Add an image URL for rich social sharing previews.",
        done: isImageLike(ogImage)
      },
      {
        label: "Open Graph URL",
        help: "Use a clean share URL for this page.",
        done: Boolean(resolvedOgUrl) && (resolvedOgUrl.startsWith("/") || /^https?:\/\//i.test(resolvedOgUrl))
      },
      {
        label: "JSON-LD syntax",
        help: "Schema must be valid JSON when provided.",
        done: isJsonValid(schemaJson)
      },
      {
        label: "JSON-LD structure",
        help: "Structured data should include @context and @type.",
        done: !schemaJson.trim() || (isJsonValid(schemaJson) && schemaJson.includes('"@context"') && schemaJson.includes('"@type"'))
      },
      {
        label: "Image alt text",
        help: "Featured or banner images should have descriptive alt text.",
        done: Boolean(featuredImageAlt || bannerImageAlt) && inlineImagesMissingAlt === 0 && blockImagesMissingAlt === 0
      },
      {
        label: "Internal links",
        help: "Add at least one relevant internal link on important CMS pages.",
        done: internalLinkCount > 0
      },
      {
        label: "Sitemap eligibility",
        help: "Published indexable pages with clean canonical URLs are eligible for sitemap inclusion.",
        done: robotsIndex && isCleanIndexablePath(permalink)
      },
      {
        label: "Indexable page",
        help: "Keep this enabled for pages that should appear in search.",
        done: robotsIndex
      }
    ];
  }, [
    bannerImageAlt,
    content,
    featuredImageAlt,
    focusKeyphrase,
    h1,
    blockImagesMissingAlt,
    ogImage,
    inlineImagesMissingAlt,
    internalLinkCount,
    permalink,
    readableContent,
    resolvedCanonicalUrl,
    resolvedMetaDescription,
    resolvedMetaTitle,
    resolvedOgDescription,
    resolvedOgTitle,
    resolvedOgUrl,
    robotsIndex,
    schemaJson,
    title,
    wordCount
  ]);
  const seoScore = useMemo(() => seoChecks.filter((check) => check.done).length, [seoChecks]);
  const readabilityChecks = useMemo(() => {
    return [
      {
        label: "Paragraph length",
        help: "Keep sections scannable for visitors and search engines.",
        done: wordCount === 0 || wordCount < 450
      },
      {
        label: "Subheading distribution",
        help: "Add H2/H3 headings to break up long content.",
        done: /<h2|<h3/i.test(content)
      },
      {
        label: "Content depth",
        help: "Aim for at least 120 words on important indexable pages.",
        done: wordCount >= 120
      }
    ];
  }, [content, wordCount]);

  useEffect(() => {
    if (!hasAdminSession()) {
      router.replace("/login");
    }
  }, [router]);

  function insertBlock(tag: "h2" | "h3" | "p" | "blockquote" | "ul" | "image") {
    const snippets = {
      h2: "<h2>Section heading</h2>",
      h3: "<h3>Supporting heading</h3>",
      p: "<p>Write a focused paragraph for this page.</p>",
      blockquote: "<blockquote>Important customer-facing quote.</blockquote>",
      ul: "<ul><li>Key point</li><li>Supporting point</li></ul>",
      image: '<p><img src="/uploads/example.webp" alt="Describe this image" loading="lazy" /></p>'
    };
    setContent((current) => `${current}${current ? "\n" : ""}${snippets[tag]}`);
  }

  function addVisualBlock(type: VisualBlock["type"]) {
    const nextBlock: VisualBlock = {
      id: `${type}-${Date.now()}`,
      type,
      schemaVersion: 1,
      title: type === "form" ? "Contact Webskitters" : "New content block",
      body: "Edit this reusable WTS CMS block from the admin panel.",
      formSlug: type === "form" ? "contact-us" : undefined,
      items: type === "cards" || type === "faq" || type === "gallery" ? [{ title: "Item title", body: "Item description" }] : []
    };
    setBlocks((current) => [...current, nextBlock]);
  }

  function updateVisualBlock(id: string, patch: Partial<VisualBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function removeVisualBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id));
  }

  function moveVisualBlock(id: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) {
        return current;
      }
      const next = [...current];
      const moved = next[index]!;
      next[index] = next[target]!;
      next[target] = moved;
      return next;
    });
  }

  function duplicateVisualBlock(block: VisualBlock) {
    setBlocks((current) => [
      ...current,
      {
        ...block,
        id: `${block.type}-${Date.now()}`,
        title: `${block.title || "Block"} copy`,
        collapsed: false
      }
    ]);
  }

  function toggleVisualBlock(id: string) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, collapsed: !block.collapsed } : block)));
  }

  function addBlockItem(id: string) {
    setBlocks((current) =>
      current.map((block) =>
        block.id === id
          ? {
              ...block,
              items: [...(block.items || []), { title: "New item", body: "Describe this item." }]
            }
          : block
      )
    );
  }

  function updateBlockItem(id: string, itemIndex: number, patch: Partial<VisualBlockItem>) {
    setBlocks((current) =>
      current.map((block) => {
        if (block.id !== id) {
          return block;
        }
        const items = [...(block.items || [])];
        items[itemIndex] = { ...items[itemIndex], ...patch };
        return { ...block, items };
      })
    );
  }

  function removeBlockItem(id: string, itemIndex: number) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, items: (block.items || []).filter((_, index) => index !== itemIndex) } : block))
    );
  }

  function resetDraft() {
    setTitle("");
    setSlugValue("");
    setH1("");
    setContent("");
    setExcerpt("");
    setTemplate("default");
    setOrder("0");
    setParentPage("");
    setFeaturedImageAlt("");
    setBannerImageAlt("");
    setMetaTitle("");
    setMetaDescription("");
    setCanonicalUrl("");
    setOgTitle("");
    setOgDescription("");
    setOgImage("");
    setOgUrl("");
    setOgType("website");
    setFocusKeyphrase("");
    setSchemaJson("");
    setRobotsIndex(true);
    setRobotsFollow(true);
    setScheduleAt("");
    setSavedId("");
    setMessage("Editor reset");
  }

  function duplicateDraft() {
    setTitle((current) => `${current || "Untitled Page"} Copy`);
    setSlugValue((current) => slugify(`${current || title || "page"} copy`));
    setSavedId("");
    setMessage("Draft duplicated locally");
  }

  function previewPage() {
    window.open(permalink, "_blank", "noopener,noreferrer");
  }

  async function openPreviewLink() {
    if (!savedId) {
      setMessage("Save the page before creating a private preview link");
      return;
    }
    const preview = await adminApi(`/api/pages/${savedId}/preview-token`, { method: "POST", body: JSON.stringify({}) });
    window.open(`/preview/${preview.token}`, "_blank", "noopener,noreferrer");
  }

  async function loadRevisions() {
    if (!savedId) {
      setMessage("Save the page before loading revisions");
      return;
    }
    const data = await adminApi(`/api/pages/${savedId}/revisions`);
    setRevisions(Array.isArray(data) ? data : []);
    setMessage("Revisions loaded");
  }

  async function restoreRevision(revisionId: string) {
    if (!savedId || !window.confirm("Restore this WTS CMS page revision?")) {
      return;
    }
    await adminApi(`/api/pages/${savedId}/revisions/${revisionId}/restore`, { method: "POST", body: JSON.stringify({}) });
    setMessage("Revision restored. Return to the list and reopen the page to refresh the editor.");
  }

  function applySchemaPreset(type: "WebPage" | "FAQPage" | "BreadcrumbList") {
    const presets = {
      WebPage: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: title || "WTS CMS page",
        url: canonicalUrl || permalink,
        description: metaDescription || excerpt
      },
      FAQPage: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: []
      },
      BreadcrumbList: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: []
      }
    };
    setSchemaJson(JSON.stringify(presets[type], null, 2));
  }

  async function persist(status: PublishStatus) {
    setSaving(true);
    setMessage("");
    try {
      const body = {
        title: title || "Untitled Page",
        h1: h1 || title || "Untitled Page",
        slug,
        permalink,
        excerpt,
        content: content || "<p></p>",
        blocks: normalizeVisualBlocks(blocks).map(({ collapsed: _collapsed, ...block }) => block),
        status,
        template,
        order: Number(order || 0),
        featuredImageAlt,
        bannerImageAlt,
        publishedAt: status === "scheduled" && scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
        ...(parentPage ? { parentPage } : {}),
        seo: {
          metaTitle,
          metaDescription,
          canonicalUrl: canonicalUrl || permalink,
          robotsIndex,
          robotsFollow,
          ogTitle: ogTitle || metaTitle || title,
          ogDescription: ogDescription || metaDescription || excerpt,
          ogImage,
          ogUrl: ogUrl || canonicalUrl || permalink,
          ogType,
          schemaJson
        }
      };
      const page = savedId
        ? await adminApi(`/api/pages/${savedId}`, { method: "PATCH", body: JSON.stringify(body) })
        : await adminApi("/api/pages", { method: "POST", body: JSON.stringify(body) });
      setSavedId(page._id);
      if (status === "published") {
        await adminApi(`/api/pages/${page._id}/publish`, { method: "POST", body: JSON.stringify({}) });
      }
      if (status === "archived") {
        await adminApi(`/api/pages/${page._id}/archive`, { method: "POST", body: JSON.stringify({}) });
      }
      setMessage(
        {
          draft: "Draft saved",
          pending_review: "Page submitted for review",
          approved: "Page approved",
          published: "Page published",
          scheduled: "Page scheduled",
          archived: "Page archived"
        }[status]
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save page");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="cms-editor">
      <header className="cms-editor-topbar">
        <div className="cms-editor-brand">
          <button
            className="cms-icon-button"
            type="button"
            aria-label="Back to pages list"
            onClick={() => (onBack ? onBack() : router.push("/dashboard"))}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <strong>WTS CMS Page Studio</strong>
            <span>Powered by Webskitters Technology Solutions Pvt. Ltd.</span>
          </div>
        </div>
        <div className="cms-editor-actions">
          {message ? <span className="cms-editor-message">{message}</span> : null}
          <button className="cms-ghost-button" type="button" onClick={() => setDraftPreviewOpen(true)}>
            <Eye size={16} /> Draft preview
          </button>
          <button className="cms-ghost-button" type="button" onClick={previewPage}>
            <Eye size={16} /> Preview
          </button>
          <button className="cms-ghost-button" type="button" disabled={saving} onClick={() => void persist("draft")}>
            <Save size={16} /> Save draft
          </button>
          <button className="cms-primary-button" type="button" disabled={saving} onClick={() => void persist("published")}>
            <Send size={16} /> Publish
          </button>
          <button className="cms-icon-button" type="button" aria-label="More actions">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </header>

      <section className="cms-editor-layout">
        <aside className="cms-editor-rail">
          <div className="cms-rail-card">
            <span className="cms-kicker">Structure</span>
            <button className={`cms-rail-item ${activePanel === "content" ? "active" : ""}`} type="button" onClick={() => setActivePanel("content")}>
              <FileText size={17} /> Page basics
            </button>
            <button className={`cms-rail-item ${activePanel === "history" ? "active" : ""}`} type="button" onClick={() => setActivePanel("history")}>
              <Heading2 size={17} /> Content blocks
            </button>
            <button className={`cms-rail-item ${activePanel === "seo" ? "active" : ""}`} type="button" onClick={() => setActivePanel("seo")}>
              <Search size={17} /> SEO metadata
            </button>
            <button className={`cms-rail-item ${activePanel === "media" ? "active" : ""}`} type="button" onClick={() => setActivePanel("media")}>
              <Image size={17} /> Media & alt text
            </button>
          </div>

          <div className="cms-rail-card">
            <span className="cms-kicker">Checks</span>
            <CheckItem done={Boolean(title)} label="Title" />
            <CheckItem done={Boolean(h1 || title)} label="H1" />
            <CheckItem done={Boolean(content)} label="Content" />
            <CheckItem done={metaDescription.length >= 80} label="Meta description" />
            <CheckItem done={robotsIndex} label="Indexable" />
          </div>
        </aside>

        <section className="cms-editor-main">
          <div className="cms-editor-card hero-card">
            <div className="cms-card-header">
              <span className="cms-kicker">Page identity</span>
              <span className="cms-status-pill">Draft</span>
            </div>
            <input
              className="cms-title-field"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (!savedId) {
                  setSlugValue(slugify(event.target.value));
                }
              }}
              placeholder="Page title"
              aria-label="Page title"
            />
            <div className="cms-field-grid">
              <label className="cms-field">
                <span>Editable H1</span>
                <input value={h1} onChange={(event) => setH1(event.target.value)} placeholder={title || "Primary heading"} />
              </label>
              <label className="cms-field">
                <span>Permalink</span>
                <div className="cms-inline-input">
                  <Link2 size={16} />
                  <input
                    value={permalink}
                    onChange={(event) => setSlugValue(event.target.value.replace(/^\//, ""))}
                    readOnly={Boolean(savedId && initialPage?.permalink === "/")}
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="cms-editor-card builder-editor-card">
            <VisualHtmlEditorTabs
              entityLabel="page"
              title={title}
              h1={h1 || title}
              permalink={permalink}
              content={content}
              onContentChange={setContent}
              blocks={blocks}
              onInsertContentBlock={(kind) => insertBlock(kind === "code" ? "p" : kind)}
              blockTemplates={[
                { label: "Hero section", value: "hero" },
                { label: "Card grid", value: "cards" },
                { label: "CTA band", value: "cta" },
                { label: "FAQ list", value: "faq" },
                { label: "Gallery", value: "gallery" },
                { label: "Form embed", value: "form" }
              ]}
              onAddVisualBlock={addVisualBlock}
              onUpdateVisualBlock={updateVisualBlock}
              onMoveVisualBlock={moveVisualBlock}
              onDuplicateVisualBlock={duplicateVisualBlock}
              onRemoveVisualBlock={removeVisualBlock}
              seoScore={seoScore}
              seoTotal={seoChecks.length}
              readabilityScore={readabilityChecks.filter((check) => check.done).length}
              readabilityTotal={readabilityChecks.length}
              wordCount={wordCount}
              auxiliaryLabel="Template"
              auxiliaryValue={template}
              onAuxiliaryChange={setTemplate}
            />
          </div>

          <div className="cms-editor-card">
            <div className="cms-card-header">
              <div>
                <span className="cms-kicker">Excerpt</span>
                <h2>Listing summary</h2>
              </div>
            </div>
            <AdminTextEditor
              mode="plain"
              minHeight={120}
              value={excerpt}
              onChange={setExcerpt}
              placeholder="Short summary used in listings, previews, and SEO fallbacks."
            />
          </div>
        </section>

        <aside className="cms-editor-panel">
          <div className="cms-panel-tabs">
            {[
              { key: "content", label: "Content", icon: PanelRight },
              { key: "seo", label: "SEO", icon: Search },
              { key: "publish", label: "Publish", icon: Calendar },
              { key: "media", label: "Media", icon: Image },
              { key: "history", label: "Actions", icon: ListChecks }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className={activePanel === item.key ? "active" : ""}
                  key={item.key}
                  type="button"
                  onClick={() => setActivePanel(item.key as PanelKey)}
                >
                  <Icon size={15} /> {item.label}
                </button>
              );
            })}
          </div>

          {activePanel === "content" ? (
            <PanelCard title="Page settings" icon={LayoutTemplate}>
              <label className="cms-field">
                <span>Template</span>
                <select value={template} onChange={(event) => setTemplate(event.target.value)}>
                  <option value="default">Default page</option>
                  <option value="landing">Landing page</option>
                  <option value="full-width">Full width</option>
                </select>
              </label>
              <label className="cms-field">
                <span>Parent page ObjectId</span>
                <input value={parentPage} onChange={(event) => setParentPage(event.target.value)} />
              </label>
              <label className="cms-field">
                <span>Menu order</span>
                <input value={order} onChange={(event) => setOrder(event.target.value)} />
              </label>
            </PanelCard>
          ) : null}

          {activePanel === "content" ? (
            <PanelCard title="Visual blocks" icon={ListPlus}>
              <div className="cms-block-actions">
                <button type="button" onClick={() => addVisualBlock("hero")}>Hero</button>
                <button type="button" onClick={() => addVisualBlock("cards")}>Cards</button>
                <button type="button" onClick={() => addVisualBlock("cta")}>CTA</button>
                <button type="button" onClick={() => addVisualBlock("faq")}>FAQ</button>
                <button type="button" onClick={() => addVisualBlock("gallery")}>Gallery</button>
                <button type="button" onClick={() => addVisualBlock("form")}>Form</button>
              </div>
              <div className="cms-visual-block-list">
                {blocks.map((block, index) => (
                  <div className="cms-visual-block" key={block.id}>
                    <div className="cms-card-header">
                      <div>
                        <span className="cms-kicker">{index + 1}. {block.type} · schema v{block.schemaVersion || 1}</span>
                        <strong>{block.title || "Untitled block"}</strong>
                      </div>
                      <div className="block-row-actions">
                        <button className="cms-icon-button" type="button" aria-label="Move block up" onClick={() => moveVisualBlock(block.id, -1)}>
                          <ArrowUp size={15} />
                        </button>
                        <button className="cms-icon-button" type="button" aria-label="Move block down" onClick={() => moveVisualBlock(block.id, 1)}>
                          <ArrowDown size={15} />
                        </button>
                        <button className="cms-icon-button" type="button" aria-label="Duplicate block" onClick={() => duplicateVisualBlock(block)}>
                          <Copy size={15} />
                        </button>
                        <button className="cms-icon-button" type="button" aria-label="Collapse block" onClick={() => toggleVisualBlock(block.id)}>
                          <PanelRight size={15} />
                        </button>
                        <button className="cms-icon-button" type="button" aria-label="Remove block" onClick={() => removeVisualBlock(block.id)}>
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                    {!block.collapsed ? (
                      <>
                        <label className="cms-field">
                          <span>Title</span>
                          <input value={block.title || ""} onChange={(event) => updateVisualBlock(block.id, { title: event.target.value })} />
                        </label>
                        <label className="cms-field">
                          <span>Body</span>
                          <textarea value={block.body || ""} onChange={(event) => updateVisualBlock(block.id, { body: event.target.value })} />
                        </label>
                        {block.type === "form" ? (
                          <label className="cms-field">
                            <span>Form slug</span>
                            <input value={block.formSlug || ""} onChange={(event) => updateVisualBlock(block.id, { formSlug: event.target.value })} />
                          </label>
                        ) : (
                          <MediaPicker
                            value={block.mediaUrl || ""}
                            onChange={(url) => updateVisualBlock(block.id, { mediaUrl: url })}
                            onAltChange={(altText) => {
                              if (!bannerImageAlt && (block.type === "hero" || block.type === "cta")) {
                                setBannerImageAlt(altText);
                              }
                            }}
                          />
                        )}
                        {["cards", "faq", "gallery"].includes(block.type) ? (
                          <div className="block-item-editor">
                            <div className="cms-card-header">
                              <span className="cms-kicker">Nested items</span>
                              <button className="cms-ghost-button compact" type="button" onClick={() => addBlockItem(block.id)}>
                                <Plus size={14} /> Add item
                              </button>
                            </div>
                            {(block.items || []).map((item, itemIndex) => (
                              <div className="block-item-row" key={`${block.id}-${itemIndex}`}>
                                <label className="cms-field">
                                  <span>Item title</span>
                                  <input value={item.title || ""} onChange={(event) => updateBlockItem(block.id, itemIndex, { title: event.target.value })} />
                                </label>
                                <label className="cms-field">
                                  <span>Item body</span>
                                  <textarea value={item.body || ""} onChange={(event) => updateBlockItem(block.id, itemIndex, { body: event.target.value })} />
                                </label>
                                {block.type === "cards" || block.type === "gallery" ? (
                                  <>
                                    <MediaPicker
                                      label="Item image"
                                      value={item.image || ""}
                                      onChange={(url) => updateBlockItem(block.id, itemIndex, { image: url })}
                                      onAltChange={(altText) => updateBlockItem(block.id, itemIndex, { imageAlt: altText })}
                                    />
                                    <label className="cms-field">
                                      <span>Item image alt</span>
                                      <input
                                        value={item.imageAlt || ""}
                                        onChange={(event) => updateBlockItem(block.id, itemIndex, { imageAlt: event.target.value })}
                                      />
                                    </label>
                                  </>
                                ) : null}
                                <button className="cms-panel-action danger" type="button" onClick={() => removeBlockItem(block.id, itemIndex)}>
                                  <X size={15} /> Remove item
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <p className="meta">Block collapsed. Use the expand control to edit this database-driven block.</p>
                    )}
                  </div>
                ))}
                {!blocks.length ? <p className="meta">Add reusable visual blocks for hero sections, FAQs, CTAs, galleries, and contact forms.</p> : null}
              </div>
            </PanelCard>
          ) : null}

          {activePanel === "seo" ? (
            <PanelCard title={`SEO score ${seoScore}/${seoChecks.length}`} icon={Search}>
              <label className="cms-field">
                <span>Focus keyphrase</span>
                <input
                  value={focusKeyphrase}
                  onChange={(event) => setFocusKeyphrase(event.target.value)}
                  placeholder="Example: web design services"
                />
              </label>
              <button className="cms-panel-action" type="button" onClick={() => setPreviewOpen(true)}>
                <Globe2 size={16} /> Open search preview
              </button>
              <div className="cms-block-actions">
                <button type="button" onClick={() => applySchemaPreset("WebPage")}>WebPage schema</button>
                <button type="button" onClick={() => applySchemaPreset("FAQPage")}>FAQ schema</button>
                <button type="button" onClick={() => applySchemaPreset("BreadcrumbList")}>Breadcrumb schema</button>
              </div>
              <label className="cms-field">
                <span>Meta title</span>
                <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} placeholder={title || "WTS CMS page"} />
                <small className={resolvedMetaTitle.length >= 50 && resolvedMetaTitle.length <= 60 ? "seo-field-hint good" : "seo-field-hint warn"}>
                  {resolvedMetaTitle.length}/60 characters. Recommended: 50-60.
                </small>
              </label>
              <label className="cms-field">
                <span>Meta description</span>
                <AdminTextEditor mode="plain" minHeight={110} value={metaDescription} onChange={setMetaDescription} />
                <small
                  className={
                    resolvedMetaDescription.length >= 150 && resolvedMetaDescription.length <= 160 ? "seo-field-hint good" : "seo-field-hint warn"
                  }
                >
                  {resolvedMetaDescription.length}/160 characters. Recommended: 150-160.
                </small>
              </label>
              <label className="cms-field">
                <span>Canonical URL</span>
                <input value={canonicalUrl} onChange={(event) => setCanonicalUrl(event.target.value)} placeholder={permalink} />
              </label>
              <label className="cms-toggle">
                <input type="checkbox" checked={robotsIndex} onChange={(event) => setRobotsIndex(event.target.checked)} />
                Index this page
              </label>
              <label className="cms-toggle">
                <input type="checkbox" checked={robotsFollow} onChange={(event) => setRobotsFollow(event.target.checked)} />
                Follow links
              </label>
              <label className="cms-field">
                <span>Open Graph title</span>
                <input value={ogTitle} onChange={(event) => setOgTitle(event.target.value)} placeholder={resolvedMetaTitle} />
              </label>
              <label className="cms-field">
                <span>Open Graph description</span>
                <AdminTextEditor mode="plain" minHeight={90} value={ogDescription} onChange={setOgDescription} />
              </label>
              <MediaPicker label="Open Graph image URL" value={ogImage} onChange={setOgImage} />
              <label className="cms-field">
                <span>Open Graph URL</span>
                <input value={ogUrl} onChange={(event) => setOgUrl(event.target.value)} placeholder={resolvedCanonicalUrl} />
              </label>
              <label className="cms-field">
                <span>Open Graph type</span>
                <select value={ogType} onChange={(event) => setOgType(event.target.value as "website" | "article" | "blog" | "profile" | "product")}>
                  <option value="website">Website</option>
                  <option value="article">Article</option>
                  <option value="blog">Blog</option>
                  <option value="profile">Profile</option>
                  <option value="product">Product</option>
                </select>
              </label>
              <label className="cms-field">
                <span>JSON-LD schema</span>
                <AdminTextEditor mode="code" minHeight={140} value={schemaJson} onChange={setSchemaJson} />
                <small className={isJsonValid(schemaJson) ? "seo-field-hint good" : "seo-field-hint warn"}>
                  {isJsonValid(schemaJson) ? "Valid JSON-LD syntax." : "Schema must be valid JSON."}
                </small>
              </label>
              <div className="cms-serp-preview">
                <strong>{resolvedMetaTitle}</strong>
                <span>{resolvedCanonicalUrl}</span>
                <p>{resolvedMetaDescription}</p>
              </div>
              <div className="seo-assistant-grid">
                <div>
                  <span className="cms-kicker">Heading outline</span>
                  {headingOutline.length ? (
                    headingOutline.map((heading) => (
                      <p className="meta" key={`${heading.level}-${heading.text}`}>
                        {heading.level}: {heading.text}
                      </p>
                    ))
                  ) : (
                    <p className="meta">No H2-H5 headings found yet.</p>
                  )}
                </div>
                <div>
                  <span className="cms-kicker">SEO tests</span>
                  <p className="meta">Keyword density: {focusKeyphrase ? `${keywordDensity}%` : "set focus keyphrase"}</p>
                  <p className="meta">Internal links: {internalLinkCount}</p>
                  <p className="meta">Inline images missing alt: {inlineImagesMissingAlt}</p>
                  <p className="meta">Block images missing alt: {blockImagesMissingAlt}</p>
                  <p className="meta">{robotsIndex ? "Eligible for sitemap when published." : "Noindex pages are excluded from sitemap."}</p>
                </div>
              </div>
              <div className="seo-analysis-group">
                <h3>SEO analysis</h3>
                {seoChecks.map((check) => (
                  <AnalysisItem key={check.label} done={check.done} label={check.label} help={check.help} />
                ))}
              </div>
              <div className="seo-analysis-group">
                <h3>Readability analysis</h3>
                {readabilityChecks.map((check) => (
                  <AnalysisItem key={check.label} done={check.done} label={check.label} help={check.help} />
                ))}
              </div>
            </PanelCard>
          ) : null}

          {activePanel === "publish" ? (
            <PanelCard title="Publishing" icon={ShieldCheck}>
              <button className="cms-panel-action" type="button" disabled={saving} onClick={() => void persist("draft")}>
                <Save size={16} /> Save draft
              </button>
              <button className="cms-panel-action" type="button" disabled={saving} onClick={() => void persist("pending_review")}>
                <ShieldCheck size={16} /> Submit for review
              </button>
              <button className="cms-panel-action" type="button" disabled={saving} onClick={() => void persist("approved")}>
                <CheckCircle2 size={16} /> Approve
              </button>
              <button className="cms-panel-action primary" type="button" disabled={saving} onClick={() => void persist("published")}>
                <Send size={16} /> Publish now
              </button>
              <label className="cms-field">
                <span>Schedule date</span>
                <input type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} />
              </label>
              <button className="cms-panel-action" type="button" disabled={saving || !scheduleAt} onClick={() => void persist("scheduled")}>
                <Calendar size={16} /> Schedule
              </button>
              <button className="cms-panel-action danger" type="button" disabled={saving} onClick={() => void persist("archived")}>
                <Archive size={16} /> Archive
              </button>
            </PanelCard>
          ) : null}

          {activePanel === "media" ? (
            <PanelCard title="Media SEO" icon={Image}>
              <MediaPicker label="Open Graph image" value={ogImage} onChange={setOgImage} />
              <label className="cms-field">
                <span>Featured image alt</span>
                <input value={featuredImageAlt} onChange={(event) => setFeaturedImageAlt(event.target.value)} />
              </label>
              <label className="cms-field">
                <span>Banner image alt</span>
                <input value={bannerImageAlt} onChange={(event) => setBannerImageAlt(event.target.value)} />
              </label>
              <button className="cms-panel-action" type="button" onClick={() => insertBlock("image")}>
                <Image size={16} /> Insert image block
              </button>
            </PanelCard>
          ) : null}

          {activePanel === "history" ? (
            <PanelCard title="More actions" icon={ListChecks}>
              <button className="cms-panel-action" type="button" onClick={duplicateDraft}>
                <Copy size={16} /> Duplicate draft
              </button>
              <button className="cms-panel-action" type="button" onClick={() => void openPreviewLink()}>
                <Eye size={16} /> Open private preview
              </button>
              <button className="cms-panel-action" type="button" onClick={() => void loadRevisions()}>
                <ListChecks size={16} /> Load revisions
              </button>
              {revisions.map((revision) => (
                <button className="cms-panel-action" key={revision._id} type="button" onClick={() => void restoreRevision(revision._id)}>
                  <RotateCcw size={16} /> {revision.reason || "revision"} · {revision.createdAt ? new Date(revision.createdAt).toLocaleString() : "saved"}
                </button>
              ))}
              <button className="cms-panel-action" type="button" onClick={resetDraft}>
                <RotateCcw size={16} /> Reset editor
              </button>
              <button className="cms-panel-action" type="button" onClick={() => insertBlock("h3")}>
                <Heading2 size={16} /> Add H3 section
              </button>
              <button className="cms-panel-action" type="button" onClick={() => insertBlock("ul")}>
                <ListChecks size={16} /> Add checklist
              </button>
            </PanelCard>
          ) : null}

          <div className="cms-panel-credit">Powered by Webskitters Technology Solutions Pvt. Ltd.</div>
        </aside>
      </section>
      {draftPreviewOpen ? (
        <div className="seo-preview-overlay" role="dialog" aria-modal="true" aria-label="Draft page preview">
          <div className="seo-preview-modal draft-preview-modal">
            <div className="seo-preview-header">
              <div>
                <span className="cms-kicker">Unsaved draft preview</span>
                <h2>{title || "Untitled WTS CMS page"}</h2>
              </div>
              <button className="cms-icon-button" type="button" aria-label="Close draft preview" onClick={() => setDraftPreviewOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <DraftPagePreview
              blocks={blocks}
              content={content}
              excerpt={excerpt}
              h1={h1 || title || "Untitled WTS CMS page"}
            />
          </div>
        </div>
      ) : null}
      {previewOpen ? (
        <div className="seo-preview-overlay" role="dialog" aria-modal="true" aria-label="Search preview">
          <div className="seo-preview-modal">
            <div className="seo-preview-header">
              <div>
                <span className="cms-kicker">Search appearance</span>
                <h2>Google preview</h2>
              </div>
              <button className="cms-icon-button" type="button" aria-label="Close preview" onClick={() => setPreviewOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="seo-preview-device-toggle">
              <button
                className={previewDevice === "mobile" ? "active" : ""}
                type="button"
                onClick={() => setPreviewDevice("mobile")}
              >
                <Smartphone size={16} /> Mobile
              </button>
              <button
                className={previewDevice === "desktop" ? "active" : ""}
                type="button"
                onClick={() => setPreviewDevice("desktop")}
              >
                <Monitor size={16} /> Desktop
              </button>
            </div>
            <div className={`seo-preview-card ${previewDevice}`}>
              <span className="seo-preview-site">wts-cms.local {permalink}</span>
              <strong>{resolvedMetaTitle}</strong>
              <p>{resolvedMetaDescription}</p>
            </div>
            <div className="seo-preview-editors">
              <label className="cms-field">
                <span>SEO title</span>
                <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} />
              </label>
              <label className="cms-field">
                <span>Slug</span>
                <input value={slug} readOnly />
              </label>
              <label className="cms-field">
                <span>Meta description</span>
                <AdminTextEditor mode="plain" minHeight={90} value={metaDescription} onChange={setMetaDescription} />
              </label>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function CheckItem({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`cms-check-item ${done ? "done" : ""}`}>
      <CheckCircle2 size={15} />
      <span>{label}</span>
    </div>
  );
}

function AnalysisItem({ done, label, help }: { done: boolean; label: string; help: string }) {
  return (
    <div className={`seo-analysis-item ${done ? "done" : "todo"}`}>
      {done ? <CheckCircle2 size={16} /> : <Lightbulb size={16} />}
      <div>
        <strong>{label}</strong>
        <span>{help}</span>
      </div>
    </div>
  );
}

function PanelCard({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: ComponentType<{ size?: number }>;
  children: ReactNode;
}) {
  return (
    <section className="cms-panel-card">
      <div className="cms-panel-card-title">
        <Icon size={17} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DraftPagePreview({
  blocks,
  content,
  excerpt,
  h1
}: {
  blocks: VisualBlock[];
  content: string;
  excerpt: string;
  h1: string;
}) {
  return (
    <article className="draft-page-preview">
      <header>
        <span className="cms-kicker">Powered by Webskitters</span>
        <h1>{h1}</h1>
        {excerpt ? <p>{excerpt}</p> : null}
      </header>
      {blocks.map((block) => (
        <section className={`draft-block draft-block-${block.type}`} key={block.id}>
          {block.mediaUrl ? <img src={resolveApiAssetUrl(block.mediaUrl)} alt="" /> : null}
          <div>
            <span className="cms-kicker">{block.type}</span>
            <h2>{block.title || "Untitled block"}</h2>
            {block.body ? <p>{block.body}</p> : null}
            {block.type === "form" ? <button type="button">Form: {block.formSlug || "contact-us"}</button> : null}
          </div>
          {block.items?.length ? (
            <div className="draft-block-items">
              {block.items.map((item, index) => (
                <article key={`${block.id}-preview-${index}`}>
                  {item.image ? <img src={resolveApiAssetUrl(item.image)} alt={item.imageAlt || ""} /> : null}
                  <strong>{item.title || "Item title"}</strong>
                  <p>{item.body || "Item description"}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ))}
      {content ? <div className="draft-rich-content" dangerouslySetInnerHTML={{ __html: content }} /> : null}
    </article>
  );
}
