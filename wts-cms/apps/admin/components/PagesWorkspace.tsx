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
import { useRouter, useSearchParams } from "next/navigation";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Copy,
  Eye,
  FileText,
  Filter,
  LayoutList,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2
} from "lucide-react";
import { AdminShell } from "./AdminShell";
import { PageEditor, type EditablePage } from "./PageEditor";
import { adminApi } from "../lib/api";

type PageStatus = "all" | "published" | "draft" | "pending_review" | "approved" | "scheduled" | "archived";

interface CmsPage extends EditablePage {
  _id: string;
  title: string;
  slug: string;
  h1?: string;
  permalink: string;
  status: Exclude<PageStatus, "all">;
  template?: string;
  order?: number;
  updatedAt?: string;
  publishedAt?: string;
  excerpt?: string;
  content?: string;
  featuredImageAlt?: string;
  bannerImageAlt?: string;
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

function seoHealth(page: CmsPage) {
  const score = [
    Boolean(page.seo?.metaTitle || page.title),
    Boolean(page.seo?.metaDescription),
    page.seo?.robotsIndex !== false
  ].filter(Boolean).length;
  return score >= 3 ? "good" : score === 2 ? "fair" : "needs-work";
}

export function PagesWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPageId = searchParams.get("edit");
  const wantsNewPage = searchParams.get("new") === "1";
  const [mode, setMode] = useState<"list" | "editor">("list");
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [editingPage, setEditingPage] = useState<CmsPage | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<PageStatus>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const counts = useMemo(() => {
    return {
      all: pages.length,
      published: pages.filter((page) => page.status === "published").length,
      draft: pages.filter((page) => page.status === "draft").length,
      pending_review: pages.filter((page) => page.status === "pending_review").length,
      approved: pages.filter((page) => page.status === "approved").length,
      scheduled: pages.filter((page) => page.status === "scheduled").length,
      archived: pages.filter((page) => page.status === "archived").length
    };
  }, [pages]);

  const filteredPages = useMemo(() => {
    return pages.filter((page) => {
      const matchesStatus = status === "all" || page.status === status;
      const searchable = `${page.title} ${page.h1 || ""} ${page.permalink}`.toLowerCase();
      return matchesStatus && searchable.includes(search.toLowerCase());
    });
  }, [pages, search, status]);

  async function loadPages() {
    setLoading(true);
    try {
      const data = await adminApi("/api/pages?limit=100");
      setPages(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load pages");
    } finally {
      setHasLoaded(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPages();
  }, []);

  useEffect(() => {
    if (wantsNewPage) {
      setEditingPage(null);
      setMode("editor");
      return;
    }

    if (editPageId) {
      if (!hasLoaded) {
        return;
      }

      const page = pages.find((item) => item._id === editPageId);
      if (page) {
        setEditingPage(page);
        setMode("editor");
        return;
      }

      setMessage("The selected page could not be found.");
      setEditingPage(null);
      setMode("list");
      router.replace("/pages");
      return;
    }

    setEditingPage(null);
    setMode("list");
  }, [editPageId, hasLoaded, pages, router, wantsNewPage]);

  function toggleSelected(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function toggleAll() {
    setSelected((current) =>
      current.length === filteredPages.length ? [] : filteredPages.map((page) => page._id)
    );
  }

  function openEditor(page?: CmsPage | null) {
    setEditingPage(page || null);
    setMode("editor");
    router.push(page?._id ? `/pages?edit=${encodeURIComponent(page._id)}` : "/pages?new=1");
  }

  async function removePage(id: string) {
    if (!window.confirm("Delete this WTS CMS page?")) {
      return;
    }
    await adminApi(`/api/pages/${id}`, { method: "DELETE" });
    setMessage("Page deleted");
    await loadPages();
  }

  async function archivePage(id: string) {
    await adminApi(`/api/pages/${id}/archive`, { method: "POST", body: JSON.stringify({}) });
    setMessage("Page archived");
    await loadPages();
  }

  if (mode === "editor") {
    return (
      <PageEditor
        initialPage={editingPage}
        onBack={() => {
          window.history.pushState(null, "", "/pages");
          setEditingPage(null);
          setMode("list");
          router.replace("/pages");
          void loadPages();
        }}
      />
    );
  }

  return (
    <AdminShell title="Pages">
      <section className="page-list-shell">
        <div className="page-list-header">
          <div>
            <span className="cms-kicker">Content inventory</span>
            <h2>Pages</h2>
            <p>Manage CMS pages, drafts, permalink health, SEO readiness, and publish state.</p>
          </div>
          <div className="page-list-actions">
            <button className="cms-ghost-button" type="button" onClick={() => void loadPages()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="cms-primary-button" type="button" onClick={() => openEditor()}>
              <Plus size={16} /> Add New
            </button>
          </div>
        </div>

        <div className="page-status-tabs">
          {(["all", "published", "draft", "pending_review", "approved", "scheduled", "archived"] as PageStatus[]).map((item) => (
            <button className={status === item ? "active" : ""} type="button" key={item} onClick={() => setStatus(item)}>
              {item.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ")}
              <span>{counts[item]}</span>
            </button>
          ))}
        </div>

        <div className="page-list-toolbar">
          <div className="page-bulk-actions">
            <select aria-label="Bulk actions">
              <option>Bulk actions</option>
              <option>Archive selected</option>
              <option>Delete selected</option>
              <option>Mark as draft</option>
            </select>
            <button className="cms-ghost-button" type="button" disabled={!selected.length}>
              Apply
            </button>
            <select aria-label="Template filter">
              <option>All templates</option>
              <option>Default page</option>
              <option>Landing page</option>
              <option>Full width</option>
            </select>
            <button className="cms-ghost-button" type="button">
              <Filter size={16} /> Filter
            </button>
          </div>

          <div className="page-search">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pages" />
          </div>
        </div>

        <div className="page-table-card">
          <table className="page-table">
            <thead>
              <tr>
                <th>
                  <input
                    checked={filteredPages.length > 0 && selected.length === filteredPages.length}
                    type="checkbox"
                    onChange={toggleAll}
                  />
                </th>
                <th>Title</th>
                <th>Template</th>
                <th>Status</th>
                <th>Updated</th>
                <th>SEO</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => {
                const health = seoHealth(page);
                return (
                  <tr key={page._id}>
                    <td>
                      <input
                        checked={selected.includes(page._id)}
                        type="checkbox"
                        onChange={() => toggleSelected(page._id)}
                      />
                    </td>
                    <td>
                      <div className="page-title-cell">
                        <FileText size={17} />
                        <div>
                          <strong>{page.title}</strong>
                          <span>{page.permalink}</span>
                          <div className="page-row-links">
                            <button type="button" onClick={() => openEditor(page)}>
                              Edit
                            </button>
                            <button type="button">Quick edit</button>
                            <button type="button" onClick={() => window.open(page.permalink, "_blank", "noopener,noreferrer")}>
                              View
                            </button>
                            <button type="button" onClick={() => void archivePage(page._id)}>
                              Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{page.template || "default"}</td>
                    <td>
                      <span className={`page-status-badge ${page.status}`}>{page.status}</span>
                    </td>
                    <td>{page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "Not saved"}</td>
                    <td>
                      <span className={`seo-dot ${health}`} title={`SEO ${health}`} />
                    </td>
                    <td>
                      <div className="page-action-icons">
                        <button type="button" aria-label="Edit page" onClick={() => openEditor(page)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" aria-label="View page" onClick={() => window.open(page.permalink, "_blank", "noopener,noreferrer")}>
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          aria-label="Duplicate page"
                          onClick={() => openEditor({ ...page, _id: "", title: `${page.title} Copy`, slug: `${page.slug}-copy`, permalink: `/${page.slug}-copy` })}
                        >
                          <Copy size={15} />
                        </button>
                        <button type="button" aria-label="Archive page" onClick={() => void archivePage(page._id)}>
                          <Archive size={15} />
                        </button>
                        <button type="button" aria-label="Delete page" onClick={() => void removePage(page._id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredPages.length ? (
                <tr>
                  <td colSpan={7}>
                    <div className="page-empty-state">
                      <LayoutList size={28} />
                      <strong>{loading ? "Loading pages..." : "No pages found"}</strong>
                      <span>Create your first WTS CMS page or adjust the current filters.</span>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="page-list-footer">
          <span>
            {filteredPages.length} item{filteredPages.length === 1 ? "" : "s"}
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
