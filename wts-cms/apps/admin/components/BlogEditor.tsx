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
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Copy,
  Eye,
  Facebook,
  FileText,
  Globe2,
  Heading2,
  Image,
  Linkedin,
  Link2,
  ListChecks,
  ListPlus,
  Monitor,
  MoreHorizontal,
  PanelRight,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Tags,
  Twitter,
  X
} from "lucide-react";
import { adminApi, hasAdminSession } from "../lib/api";
import { AdminTextEditor } from "./AdminTextEditor";
import type { BlogPost } from "./BlogsWorkspace";

type PanelKey = "content" | "seo" | "publish" | "taxonomy" | "social";
type PublishStatus = "draft" | "pending_review" | "approved" | "published" | "scheduled" | "archived";
type BlogBlock = { id: string; type: "cta" | "faq" | "gallery"; title?: string; body?: string; mediaUrl?: string };

interface TaxonomyOption {
  _id: string;
  name: string;
  slug: string;
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

function estimateReadingTime(value: string) {
  const words = plainTextFromHtml(value).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function extractToc(value: string) {
  return Array.from(value.matchAll(/<h([23])[^>]*>(.*?)<\/h[23]>/gi)).map((match) => ({
    level: Number(match[1] || 2),
    text: plainTextFromHtml(match[2] || ""),
    anchor: slugify(plainTextFromHtml(match[2] || ""))
  }));
}

export function BlogEditor({ initialBlog, onBack }: { initialBlog?: BlogPost | null; onBack?: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialBlog?.title || "");
  const [h1, setH1] = useState(initialBlog?.h1 || "");
  const [content, setContent] = useState(initialBlog?.content || "");
  const [blocks, setBlocks] = useState<BlogBlock[]>((initialBlog?.blocks as BlogBlock[]) || []);
  const [excerpt, setExcerpt] = useState(initialBlog?.excerpt || "");
  const [authorName, setAuthorName] = useState(initialBlog?.authorName || "Webskitters Editorial Team");
  const [featuredImage, setFeaturedImage] = useState(initialBlog?.featuredImage || "");
  const [featuredImageAlt, setFeaturedImageAlt] = useState(initialBlog?.featuredImageAlt || "");
  const [metaTitle, setMetaTitle] = useState(initialBlog?.seo?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialBlog?.seo?.metaDescription || "");
  const [canonicalUrl, setCanonicalUrl] = useState(initialBlog?.seo?.canonicalUrl || "");
  const [ogTitle, setOgTitle] = useState(initialBlog?.seo?.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(initialBlog?.seo?.ogDescription || "");
  const [ogImage, setOgImage] = useState(initialBlog?.seo?.ogImage || "");
  const [ogUrl, setOgUrl] = useState(initialBlog?.seo?.ogUrl || "");
  const [ogType, setOgType] = useState<"website" | "article" | "blog" | "profile" | "product">(initialBlog?.seo?.ogType || "article");
  const [focusKeyphrase, setFocusKeyphrase] = useState("");
  const [schemaJson, setSchemaJson] = useState(initialBlog?.seo?.schemaJson || "");
  const [robotsIndex, setRobotsIndex] = useState(initialBlog?.seo?.robotsIndex !== false);
  const [robotsFollow, setRobotsFollow] = useState(initialBlog?.seo?.robotsFollow !== false);
  const [scheduleAt, setScheduleAt] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialBlog?.categories || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialBlog?.tags || []);
  const [categories, setCategories] = useState<TaxonomyOption[]>([]);
  const [tags, setTags] = useState<TaxonomyOption[]>([]);
  const [activePanel, setActivePanel] = useState<PanelKey>("content");
  const [savedId, setSavedId] = useState(initialBlog?._id || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "desktop">("mobile");
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);

  const slug = useMemo(() => slugify(title || "untitled-blog-post"), [title]);
  const permalink = useMemo(() => `/blog/${slug}`, [slug]);
  const wordCount = useMemo(() => plainTextFromHtml(content).split(/\s+/).filter(Boolean).length, [content]);
  const readingTime = useMemo(() => estimateReadingTime(content), [content]);
  const tableOfContents = useMemo(() => extractToc(content), [content]);
  const readableContent = useMemo(() => plainTextFromHtml(content), [content]);
  const resolvedMetaTitle = metaTitle || title || "WTS CMS Blog | Powered by Webskitters";
  const resolvedMetaDescription =
    metaDescription || excerpt || "WTS CMS blog article powered by Webskitters Technology Solutions Pvt. Ltd.";
  const resolvedCanonicalUrl = canonicalUrl || permalink;
  const resolvedOgTitle = ogTitle || resolvedMetaTitle;
  const resolvedOgDescription = ogDescription || resolvedMetaDescription;
  const resolvedOgUrl = ogUrl || resolvedCanonicalUrl;
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
        label: "Clean blog URL",
        help: "Keep URLs lowercase with hyphens and no query strings, hashes, spaces, or underscores.",
        done: isCleanIndexablePath(permalink)
      },
      {
        label: "Focus keyphrase in article",
        help: "Mention the focus keyphrase naturally in the blog body.",
        done: focusKeyphrase
          ? `${resolvedMetaTitle} ${h1 || title} ${resolvedMetaDescription} ${readableContent}`
              .toLowerCase()
              .includes(focusKeyphrase.toLowerCase())
          : false
      },
      {
        label: "Single H1 rule",
        help: "Keep the article H1 in the dedicated field and avoid H1 tags inside the editor.",
        done: !/<h1[\s>]/i.test(content) && Boolean(h1 || title)
      },
      {
        label: "Featured image alt text",
        help: "Add descriptive alt text for social and image SEO.",
        done: featuredImageAlt.length > 0
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
        done: isImageLike(ogImage || featuredImage)
      },
      {
        label: "Open Graph URL",
        help: "Use a clean share URL for this article.",
        done: Boolean(resolvedOgUrl) && (resolvedOgUrl.startsWith("/") || /^https?:\/\//i.test(resolvedOgUrl))
      },
      {
        label: "JSON-LD syntax",
        help: "BlogPosting schema must be valid JSON when provided.",
        done: isJsonValid(schemaJson)
      },
      {
        label: "Indexable article",
        help: "Keep this enabled for posts that should appear in search.",
        done: robotsIndex
      }
    ];
  }, [
    content,
    featuredImage,
    featuredImageAlt,
    focusKeyphrase,
    h1,
    ogImage,
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
    title
  ]);
  const seoScore = useMemo(() => seoChecks.filter((check) => check.done).length, [seoChecks]);
  const readabilityChecks = useMemo(() => {
    return [
      {
        label: "Subheading distribution",
        help: "Use H2/H3 sections so readers can scan the article.",
        done: tableOfContents.length > 0
      },
      {
        label: "Article depth",
        help: "Aim for at least 300 words for meaningful editorial content.",
        done: wordCount >= 300
      },
      {
        label: "Excerpt available",
        help: "Write a concise intro for listings and social previews.",
        done: excerpt.length >= 40
      }
    ];
  }, [excerpt, tableOfContents.length, wordCount]);

  useEffect(() => {
    if (!hasAdminSession()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    void Promise.all([adminApi("/api/categories?limit=100"), adminApi("/api/tags?limit=100")])
      .then(([categoryData, tagData]) => {
        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setTags(Array.isArray(tagData) ? tagData : []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load taxonomy"));
  }, []);

  function toggleSelection(value: string, selected: string[], setSelected: (values: string[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  }

  function insertBlock(tag: "h2" | "h3" | "p" | "blockquote" | "ul" | "image" | "code") {
    const snippets = {
      h2: "<h2>Article section heading</h2>",
      h3: "<h3>Supporting article point</h3>",
      p: "<p>Write a focused paragraph for this blog post.</p>",
      blockquote: "<blockquote>Pull out a strong insight or customer-facing quote.</blockquote>",
      ul: "<ul><li>Key takeaway</li><li>Supporting detail</li></ul>",
      image: '<p><img src="/uploads/example.webp" alt="Describe this blog image" loading="lazy" /></p>',
      code: "<pre><code>// Add a short useful code sample</code></pre>"
    };
    setContent((current) => `${current}${current ? "\n" : ""}${snippets[tag]}`);
  }

  function addBlogBlock(type: BlogBlock["type"]) {
    setBlocks((current) => [
      ...current,
      {
        id: `${type}-${Date.now()}`,
        type,
        title: type === "cta" ? "Need a CMS starter?" : "New article block",
        body: "Edit this WTS CMS article block from the admin panel."
      }
    ]);
  }

  function updateBlogBlock(id: string, patch: Partial<BlogBlock>) {
    setBlocks((current) => current.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  }

  function resetDraft() {
    setTitle("");
    setH1("");
    setContent("");
    setExcerpt("");
    setAuthorName("Webskitters Editorial Team");
    setFeaturedImage("");
    setFeaturedImageAlt("");
    setMetaTitle("");
    setMetaDescription("");
    setCanonicalUrl("");
    setOgTitle("");
    setOgDescription("");
    setOgImage("");
    setOgUrl("");
    setOgType("article");
    setFocusKeyphrase("");
    setSchemaJson("");
    setRobotsIndex(true);
    setRobotsFollow(true);
    setScheduleAt("");
    setSelectedCategories([]);
    setSelectedTags([]);
    setSavedId("");
    setMessage("Editor reset");
  }

  function duplicateDraft() {
    setTitle((current) => `${current || "Untitled Blog Post"} Copy`);
    setSavedId("");
    setMessage("Draft duplicated locally");
  }

  function previewBlog() {
    window.open(permalink, "_blank", "noopener,noreferrer");
  }

  async function openPreviewLink() {
    if (!savedId) {
      setMessage("Save the blog post before creating a private preview link");
      return;
    }
    const preview = await adminApi(`/api/blogs/${savedId}/preview-token`, { method: "POST", body: JSON.stringify({}) });
    window.open(`/preview/${preview.token}`, "_blank", "noopener,noreferrer");
  }

  async function loadRevisions() {
    if (!savedId) {
      setMessage("Save the blog post before loading revisions");
      return;
    }
    const data = await adminApi(`/api/blogs/${savedId}/revisions`);
    setRevisions(Array.isArray(data) ? data : []);
    setMessage("Revisions loaded");
  }

  async function restoreRevision(revisionId: string) {
    if (!savedId || !window.confirm("Restore this WTS CMS blog revision?")) {
      return;
    }
    await adminApi(`/api/blogs/${savedId}/revisions/${revisionId}/restore`, { method: "POST", body: JSON.stringify({}) });
    setMessage("Revision restored. Return to the list and reopen the post to refresh the editor.");
  }

  function applySchemaPreset(type: "BlogPosting" | "FAQPage" | "BreadcrumbList") {
    const presets = {
      BlogPosting: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title || "WTS CMS blog post",
        description: metaDescription || excerpt,
        author: { "@type": "Organization", name: authorName || "Webskitters Editorial Team" },
        publisher: { "@type": "Organization", name: "Webskitters Technology Solutions Pvt. Ltd." }
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
        title: title || "Untitled Blog Post",
        h1: h1 || title || "Untitled Blog Post",
        slug,
        excerpt,
        content: content || "<p></p>",
        blocks,
        status,
        authorName: authorName || "Webskitters Editorial Team",
        featuredImage,
        featuredImageAlt,
        categories: selectedCategories,
        tags: selectedTags,
        publishedAt: status === "scheduled" && scheduleAt ? new Date(scheduleAt).toISOString() : undefined,
        seo: {
          metaTitle: resolvedMetaTitle,
          metaDescription: resolvedMetaDescription,
          canonicalUrl: canonicalUrl || permalink,
          robotsIndex,
          robotsFollow,
          ogTitle: ogTitle || resolvedMetaTitle,
          ogDescription: ogDescription || resolvedMetaDescription,
          ogImage: ogImage || featuredImage,
          ogUrl: ogUrl || canonicalUrl || permalink,
          ogType,
          schemaJson
        }
      };
      const blog = savedId
        ? await adminApi(`/api/blogs/${savedId}`, { method: "PATCH", body: JSON.stringify(body) })
        : await adminApi("/api/blogs", { method: "POST", body: JSON.stringify(body) });
      setSavedId(blog._id);
      if (status === "published") {
        await adminApi(`/api/blogs/${blog._id}/publish`, { method: "POST", body: JSON.stringify({}) });
      }
      if (status === "archived") {
        await adminApi(`/api/blogs/${blog._id}/archive`, { method: "POST", body: JSON.stringify({}) });
      }
      setMessage(
        {
          draft: "Draft saved",
          pending_review: "Blog post submitted for review",
          approved: "Blog post approved",
          published: "Blog post published",
          scheduled: "Blog post scheduled",
          archived: "Blog post archived"
        }[status]
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save blog post");
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
            aria-label="Back to blog post list"
            onClick={() => (onBack ? onBack() : router.push("/dashboard"))}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <strong>WTS CMS Blog Studio</strong>
            <span>Powered by Webskitters Technology Solutions Pvt. Ltd.</span>
          </div>
        </div>
        <div className="cms-editor-actions">
          {message ? <span className="cms-editor-message">{message}</span> : null}
          <button className="cms-ghost-button" type="button" onClick={previewBlog}>
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
              <BookOpen size={17} /> Blog basics
            </button>
            <button className={`cms-rail-item ${activePanel === "social" ? "active" : ""}`} type="button" onClick={() => setActivePanel("social")}>
              <Heading2 size={17} /> Article blocks
            </button>
            <button className={`cms-rail-item ${activePanel === "taxonomy" ? "active" : ""}`} type="button" onClick={() => setActivePanel("taxonomy")}>
              <Tags size={17} /> Categories & tags
            </button>
            <button className={`cms-rail-item ${activePanel === "seo" ? "active" : ""}`} type="button" onClick={() => setActivePanel("seo")}>
              <Search size={17} /> SEO metadata
            </button>
          </div>

          <div className="cms-rail-card">
            <span className="cms-kicker">Editorial checks</span>
            <CheckItem done={Boolean(title)} label="Title" />
            <CheckItem done={Boolean(h1 || title)} label="H1" />
            <CheckItem done={wordCount >= 300} label="Article depth" />
            <CheckItem done={tableOfContents.length > 0} label="TOC headings" />
            <CheckItem done={featuredImageAlt.length > 0} label="Featured alt" />
          </div>
        </aside>

        <section className="cms-editor-main">
          <div className="cms-editor-card hero-card">
            <div className="cms-card-header">
              <span className="cms-kicker">Article identity</span>
              <span className="cms-status-pill">{savedId ? "Saved article" : "Draft"}</span>
            </div>
            <input
              className="cms-title-field"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Blog post title"
              aria-label="Blog post title"
            />
            <div className="cms-field-grid">
              <label className="cms-field">
                <span>Editable H1</span>
                <input value={h1} onChange={(event) => setH1(event.target.value)} placeholder={title || "Primary article heading"} />
              </label>
              <label className="cms-field">
                <span>Permalink</span>
                <div className="cms-inline-input">
                  <Link2 size={16} />
                  <input value={permalink} readOnly />
                </div>
              </label>
            </div>
            <div className="blog-stat-strip">
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
              <span>{tableOfContents.length} TOC item{tableOfContents.length === 1 ? "" : "s"}</span>
            </div>
          </div>

          <div className="cms-editor-card">
            <div className="cms-card-header">
              <div>
                <span className="cms-kicker">Article editor</span>
                <h2>Write the blog body</h2>
              </div>
              <div className="cms-block-actions">
                <button type="button" onClick={() => insertBlock("p")}>
                  <Plus size={15} /> Paragraph
                </button>
                <button type="button" onClick={() => insertBlock("h2")}>
                  <Heading2 size={15} /> H2
                </button>
                <button type="button" onClick={() => insertBlock("blockquote")}>
                  <Quote size={15} /> Quote
                </button>
                <button type="button" onClick={() => insertBlock("ul")}>
                  <ListPlus size={15} /> List
                </button>
              </div>
            </div>
            <AdminTextEditor
              mode="rich"
              minHeight={380}
              value={content}
              onChange={setContent}
              placeholder="<h2>Article section heading</h2>&#10;<p>Write your blog content here...</p>"
            />
            <div className="cms-editor-metrics">
              <span>{readingTime} min read</span>
              <span>H2/H3 used for table of contents</span>
              <span>Visual and HTML editing enabled</span>
            </div>
          </div>

          <div className="cms-editor-card">
            <div className="cms-card-header">
              <div>
                <span className="cms-kicker">Excerpt</span>
                <h2>Article summary</h2>
              </div>
            </div>
            <AdminTextEditor
              mode="plain"
              minHeight={120}
              value={excerpt}
              onChange={setExcerpt}
              placeholder="Short summary used in blog listings, social previews, and SEO fallbacks."
            />
          </div>
        </section>

        <aside className="cms-editor-panel">
          <div className="cms-panel-tabs">
            {[
              { key: "content", label: "Content", icon: PanelRight },
              { key: "seo", label: "SEO", icon: Search },
              { key: "taxonomy", label: "Taxonomy", icon: Tags },
              { key: "publish", label: "Publish", icon: Calendar },
              { key: "social", label: "Social", icon: Globe2 }
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
            <PanelCard title="Article settings" icon={FileText}>
              <label className="cms-field">
                <span>Author name</span>
                <input value={authorName} onChange={(event) => setAuthorName(event.target.value)} />
              </label>
              <label className="cms-field">
                <span>Featured image URL</span>
                <input value={featuredImage} onChange={(event) => setFeaturedImage(event.target.value)} placeholder="/uploads/article.webp" />
              </label>
              <label className="cms-field">
                <span>Featured image alt</span>
                <input value={featuredImageAlt} onChange={(event) => setFeaturedImageAlt(event.target.value)} />
              </label>
              <button className="cms-panel-action" type="button" onClick={() => insertBlock("image")}>
                <Image size={16} /> Insert image block
              </button>
              <div className="cms-block-actions">
                <button type="button" onClick={() => addBlogBlock("cta")}>CTA block</button>
                <button type="button" onClick={() => addBlogBlock("faq")}>FAQ block</button>
                <button type="button" onClick={() => addBlogBlock("gallery")}>Gallery block</button>
              </div>
              <div className="cms-visual-block-list">
                {blocks.map((block) => (
                  <div className="cms-visual-block" key={block.id}>
                    <span className="cms-kicker">{block.type}</span>
                    <label className="cms-field">
                      <span>Title</span>
                      <input value={block.title || ""} onChange={(event) => updateBlogBlock(block.id, { title: event.target.value })} />
                    </label>
                    <label className="cms-field">
                      <span>Body</span>
                      <textarea value={block.body || ""} onChange={(event) => updateBlogBlock(block.id, { body: event.target.value })} />
                    </label>
                  </div>
                ))}
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
                  placeholder="Example: product page seo"
                />
              </label>
              <button className="cms-panel-action" type="button" onClick={() => setPreviewOpen(true)}>
                <Globe2 size={16} /> Open search preview
              </button>
              <div className="cms-block-actions">
                <button type="button" onClick={() => applySchemaPreset("BlogPosting")}>BlogPosting schema</button>
                <button type="button" onClick={() => applySchemaPreset("FAQPage")}>FAQ schema</button>
                <button type="button" onClick={() => applySchemaPreset("BreadcrumbList")}>Breadcrumb schema</button>
              </div>
              <label className="cms-field">
                <span>Meta title</span>
                <input value={metaTitle} onChange={(event) => setMetaTitle(event.target.value)} placeholder={title || "WTS CMS blog post"} />
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
                Index this article
              </label>
              <label className="cms-toggle">
                <input type="checkbox" checked={robotsFollow} onChange={(event) => setRobotsFollow(event.target.checked)} />
                Follow links
              </label>
              <label className="cms-field">
                <span>BlogPosting JSON-LD</span>
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

          {activePanel === "taxonomy" ? (
            <PanelCard title="Categories & tags" icon={Tags}>
              <div className="blog-taxonomy-group">
                <span>Categories</span>
                {categories.length ? (
                  categories.map((category) => (
                    <label className="cms-toggle" key={category._id}>
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => toggleSelection(category._id, selectedCategories, setSelectedCategories)}
                      />
                      {category.name}
                    </label>
                  ))
                ) : (
                  <p>No categories available yet.</p>
                )}
              </div>
              <div className="blog-taxonomy-group">
                <span>Tags</span>
                {tags.length ? (
                  tags.map((tag) => (
                    <label className="cms-toggle" key={tag._id}>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag._id)}
                        onChange={() => toggleSelection(tag._id, selectedTags, setSelectedTags)}
                      />
                      {tag.name}
                    </label>
                  ))
                ) : (
                  <p>No tags available yet.</p>
                )}
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

          {activePanel === "social" ? (
            <PanelCard title="Social sharing" icon={Globe2}>
              <label className="cms-field">
                <span>Open Graph title</span>
                <input value={ogTitle} onChange={(event) => setOgTitle(event.target.value)} placeholder={resolvedMetaTitle} />
              </label>
              <label className="cms-field">
                <span>Open Graph description</span>
                <AdminTextEditor mode="plain" minHeight={90} value={ogDescription} onChange={setOgDescription} />
              </label>
              <label className="cms-field">
                <span>Open Graph image</span>
                <input value={ogImage} onChange={(event) => setOgImage(event.target.value)} placeholder={featuredImage || "/uploads/blog-og.webp"} />
              </label>
              <label className="cms-field">
                <span>Open Graph URL</span>
                <input value={ogUrl} onChange={(event) => setOgUrl(event.target.value)} placeholder={resolvedCanonicalUrl} />
              </label>
              <label className="cms-field">
                <span>Open Graph type</span>
                <select value={ogType} onChange={(event) => setOgType(event.target.value as "website" | "article" | "blog" | "profile" | "product")}>
                  <option value="article">Article</option>
                  <option value="blog">Blog</option>
                  <option value="website">Website</option>
                  <option value="profile">Profile</option>
                  <option value="product">Product</option>
                </select>
              </label>
              <div className="blog-social-preview">
                <strong>{resolvedOgTitle}</strong>
                <p>{resolvedOgDescription}</p>
                <span>{resolvedOgUrl}</span>
              </div>
              <div className="blog-share-actions">
                <button type="button" aria-label="Facebook share preview">
                  <Facebook size={16} />
                </button>
                <button type="button" aria-label="X share preview">
                  <Twitter size={16} />
                </button>
                <button type="button" aria-label="LinkedIn share preview">
                  <Linkedin size={16} />
                </button>
                <button type="button" aria-label="Copy blog link" onClick={() => void navigator.clipboard?.writeText(permalink)}>
                  <Copy size={16} />
                </button>
              </div>
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
            </PanelCard>
          ) : null}

          <div className="cms-panel-credit">Powered by Webskitters Technology Solutions Pvt. Ltd.</div>
        </aside>
      </section>

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
      <CheckCircle2 size={16} />
      <div>
        <strong>{label}</strong>
        <span>{help}</span>
      </div>
    </div>
  );
}

function PanelCard({
  children,
  icon: Icon,
  title
}: {
  children: ReactNode;
  icon: ComponentType<{ size?: number }>;
  title: string;
}) {
  return (
    <div className="cms-panel-card">
      <div className="cms-panel-title">
        <Icon size={17} />
        <h2>{title}</h2>
      </div>
      {children}
    </div>
  );
}
