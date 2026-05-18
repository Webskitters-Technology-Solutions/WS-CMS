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

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  Filter,
  LayoutList,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from "lucide-react";
import { AdminShell } from "./AdminShell";
import { BlogEditor } from "./BlogEditor";
import { adminApi } from "../lib/api";

type BlogStatus = "all" | "published" | "draft" | "pending_review" | "approved" | "scheduled" | "archived";

export interface BlogPost {
  _id: string;
  title: string;
  h1?: string;
  slug: string;
  permalink: string;
  status: Exclude<BlogStatus, "all">;
  authorName?: string;
  readingTime?: number;
  updatedAt?: string;
  publishedAt?: string;
  categories?: string[];
  tags?: string[];
  excerpt?: string;
  content?: string;
  blocks?: Array<Record<string, unknown>>;
  featuredImage?: string;
  featuredImageAlt?: string;
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

function seoHealth(blog: BlogPost) {
  const score = [
    Boolean(blog.seo?.metaTitle || blog.title),
    Boolean(blog.seo?.metaDescription || blog.excerpt),
    Boolean(blog.featuredImageAlt),
    blog.seo?.robotsIndex !== false
  ].filter(Boolean).length;
  return score >= 4 ? "good" : score >= 2 ? "fair" : "needs-work";
}

export function BlogsWorkspace() {
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<BlogStatus>("all");
  const [search, setSearch] = useState("");
  const [bulkAction, setBulkAction] = useState("archive");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const counts = useMemo(() => {
    return {
      all: blogs.length,
      published: blogs.filter((blog) => blog.status === "published").length,
      draft: blogs.filter((blog) => blog.status === "draft").length,
      pending_review: blogs.filter((blog) => blog.status === "pending_review").length,
      approved: blogs.filter((blog) => blog.status === "approved").length,
      scheduled: blogs.filter((blog) => blog.status === "scheduled").length,
      archived: blogs.filter((blog) => blog.status === "archived").length
    };
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesStatus = status === "all" || blog.status === status;
      const searchable = `${blog.title} ${blog.h1 || ""} ${blog.authorName || ""} ${blog.permalink}`.toLowerCase();
      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [blogs, search, status]);

  async function loadBlogs() {
    setLoading(true);
    try {
      const data = await adminApi("/api/blogs?limit=100");
      setBlogs(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBlogs();
  }, []);

  function openEditor(blog?: BlogPost) {
    setEditingBlog(blog || null);
    setMode("editor");
  }

  function toggleSelected(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected((current) =>
      current.length === filteredBlogs.length ? [] : filteredBlogs.map((blog) => blog._id)
    );
  }

  async function removeBlog(id: string) {
    if (!window.confirm("Delete this WTS CMS blog post?")) {
      return;
    }
    await adminApi(`/api/blogs/${id}`, { method: "DELETE" });
    setMessage("Blog post deleted");
    await loadBlogs();
  }

  async function archiveBlog(id: string) {
    await adminApi(`/api/blogs/${id}/archive`, { method: "POST", body: JSON.stringify({}) });
    setMessage("Blog post archived");
    await loadBlogs();
  }

  async function publishBlog(id: string) {
    await adminApi(`/api/blogs/${id}/publish`, { method: "POST", body: JSON.stringify({}) });
    setMessage("Blog post published");
    await loadBlogs();
  }

  async function applyBulkAction() {
    if (!selected.length) {
      return;
    }
    if (bulkAction === "delete" && !window.confirm(`Delete ${selected.length} selected blog post(s)?`)) {
      return;
    }
    await Promise.all(
      selected.map((id) =>
        bulkAction === "delete"
          ? adminApi(`/api/blogs/${id}`, { method: "DELETE" })
          : adminApi(`/api/blogs/${id}/archive`, { method: "POST", body: JSON.stringify({}) })
      )
    );
    setSelected([]);
    setMessage(bulkAction === "delete" ? "Selected blog posts deleted" : "Selected blog posts archived");
    await loadBlogs();
  }

  if (mode === "editor") {
    return (
      <BlogEditor
        initialBlog={editingBlog}
        onBack={() => {
          setMode("list");
          void loadBlogs();
        }}
      />
    );
  }

  return (
    <AdminShell title="Blog Posts">
      <section className="page-list-shell">
        <div className="page-list-header">
          <div>
            <span className="cms-kicker">Editorial inventory</span>
            <h2>Blog Posts</h2>
            <p>Manage articles, drafts, taxonomy, reading time, SEO readiness, and publish state.</p>
          </div>
          <div className="page-list-actions">
            <button className="cms-ghost-button" type="button" onClick={() => void loadBlogs()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="cms-primary-button" type="button" onClick={() => openEditor()}>
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        <div className="page-status-tabs">
          {(["all", "published", "draft", "pending_review", "approved", "scheduled", "archived"] as BlogStatus[]).map((item) => (
            <button className={status === item ? "active" : ""} type="button" key={item} onClick={() => setStatus(item)}>
              {item.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")}
              <span>{counts[item]}</span>
            </button>
          ))}
        </div>

        <div className="page-list-toolbar">
          <div className="page-bulk-actions">
            <select value={bulkAction} aria-label="Bulk actions" onChange={(event) => setBulkAction(event.target.value)}>
              <option value="archive">Archive selected</option>
              <option value="delete">Delete selected</option>
            </select>
            <button className="cms-ghost-button" type="button" disabled={!selected.length} onClick={() => void applyBulkAction()}>
              Apply
            </button>
            <select aria-label="Editorial filter">
              <option>All editorial states</option>
              <option>Needs SEO work</option>
              <option>Missing featured alt</option>
              <option>Ready to publish</option>
            </select>
            <button className="cms-ghost-button" type="button">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="page-search">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search blog posts" />
          </div>
        </div>

        <div className="page-table-card">
          <table className="page-table">
            <thead>
              <tr>
                <th>
                  <input
                    checked={filteredBlogs.length > 0 && selected.length === filteredBlogs.length}
                    type="checkbox"
                    onChange={toggleAll}
                  />
                </th>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Reading</th>
                <th>Updated</th>
                <th>SEO</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => {
                const health = seoHealth(blog);
                return (
                  <tr key={blog._id}>
                    <td>
                      <input
                        checked={selected.includes(blog._id)}
                        type="checkbox"
                        onChange={() => toggleSelected(blog._id)}
                      />
                    </td>
                    <td>
                      <div className="page-title-cell">
                        <BookOpen size={17} />
                        <div>
                          <strong>{blog.title}</strong>
                          <span>{blog.permalink}</span>
                          <div className="page-row-links">
                            <button type="button" onClick={() => openEditor(blog)}>
                              Edit
                            </button>
                            <button type="button" onClick={() => openEditor({ ...blog, _id: "", title: `${blog.title} Copy` })}>
                              Duplicate
                            </button>
                            <button type="button" onClick={() => window.open(blog.permalink, "_blank", "noopener,noreferrer")}>
                              View
                            </button>
                            <button type="button" onClick={() => void publishBlog(blog._id)}>
                              Publish
                            </button>
                            <button type="button" onClick={() => void archiveBlog(blog._id)}>
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{blog.authorName || "Webskitters Editorial Team"}</td>
                    <td>
                      <span className={`page-status-badge ${blog.status}`}>{blog.status}</span>
                    </td>
                    <td>{blog.readingTime || 1} min</td>
                    <td>{blog.updatedAt ? new Date(blog.updatedAt).toLocaleDateString() : "Not saved"}</td>
                    <td>
                      <span className={`seo-dot ${health}`} title={`SEO ${health}`} />
                    </td>
                    <td>
                      <div className="page-action-icons">
                        <button type="button" aria-label="Edit blog post" onClick={() => openEditor(blog)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" aria-label="View blog post" onClick={() => window.open(blog.permalink, "_blank", "noopener,noreferrer")}>
                          <Eye size={15} />
                        </button>
                        <button type="button" aria-label="Duplicate blog post" onClick={() => openEditor({ ...blog, _id: "", title: `${blog.title} Copy` })}>
                          <Copy size={15} />
                        </button>
                        <button type="button" aria-label="Archive blog post" onClick={() => void archiveBlog(blog._id)}>
                          <Archive size={15} />
                        </button>
                        <button type="button" aria-label="Delete blog post" onClick={() => void removeBlog(blog._id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredBlogs.length ? (
                <tr>
                  <td colSpan={8}>
                    <div className="page-empty-state">
                      <LayoutList size={28} />
                      <strong>{loading ? "Loading blog posts..." : "No blog posts found"}</strong>
                      <span>Create your first WTS CMS article or adjust the current filters.</span>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="page-list-footer">
          <span>
            {filteredBlogs.length} item{filteredBlogs.length === 1 ? "" : "s"}
            {selected.length ? `, ${selected.length} selected` : ""}
          </span>
          <div className="page-pagination">
            <button type="button" aria-label="Previous page">
              <ChevronLeft size={15} />
            </button>
            <span>1 of 1</span>
            <button type="button" aria-label="Next page">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        {message ? <p className="page-list-message">{message}</p> : null}
      </section>
    </AdminShell>
  );
}
