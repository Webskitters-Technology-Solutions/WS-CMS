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

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Search, Upload } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi, resolveApiAssetUrl } from "../../lib/api";

export default function MediaAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const params = new URLSearchParams();
    if (search) {
      params.set("search", search);
    }
    if (folder) {
      params.set("folder", folder);
    }
    setItems(await adminApi(`/api/media?${params.toString()}`));
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error.message));
  }, []);

  function altScore(item: any) {
    if (!item.altText) {
      return "needs alt";
    }
    if (item.altText.length < 8 || item.altText.length > 140) {
      return "review alt";
    }
    return "good alt";
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) {
      setMessage("Choose an image before uploading.");
      return;
    }

    try {
      setUploading(true);
      await adminApi("/api/media/upload", {
        method: "POST",
        body: data
      });
      setMessage("Image uploaded to the WTS CMS media library.");
      await load();
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }
  return (
    <AdminShell title="Media">
      <form className="panel media-upload-panel" onSubmit={upload}>
        <div>
          <span className="eyebrow">Media library</span>
          <h2>Upload images directly</h2>
          <p className="muted">Add reusable images for pages, blogs, articles, menus, and visual content blocks.</p>
        </div>
        <div className="media-upload-grid">
          <label className="field">Image file<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
          <label className="field">Alt text<input name="altText" placeholder="Short, descriptive image alt text" /></label>
          <label className="field">Folder<input name="folder" placeholder="Library, Case Studies, Team" /></label>
        </div>
        <button type="submit" disabled={uploading}><Upload size={18} /> {uploading ? "Uploading..." : "Upload image"}</button>
        {message ? <p>{message}</p> : null}
      </form>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media, alt text, folder" />
          <input value={folder} onChange={(event) => setFolder(event.target.value)} placeholder="Folder filter" />
          <button className="ghost" onClick={() => void load()}><Search size={18} /> Filter</button>
        </div>
      </section>
      <section className="grid" style={{ marginTop: 16 }}>
        {items.map((item) => (
          <div className="card media-library-card" key={item._id}>
            <img src={resolveApiAssetUrl(item.url)} alt={item.altText || ""} />
            <strong>{item.originalName}</strong>
            <p>{item.altText || "Missing alt text"}</p>
            <p className="meta">{item.folder || "Library"} · {item.mimeType} · {item.width || "?"}x{item.height || "?"} · {altScore(item)}</p>
            <code>{item.url}</code>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
