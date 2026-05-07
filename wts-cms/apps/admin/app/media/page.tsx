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
import { Search, Upload } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi } from "../../lib/api";

export default function MediaAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("");
  const [message, setMessage] = useState("");

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

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const data = new FormData(event.currentTarget);
      await adminApi("/api/media/upload", {
        method: "POST",
        body: data
      });
      setMessage("Uploaded");
      await load();
      event.currentTarget.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  }
  return (
    <AdminShell title="Media">
      <form className="panel" onSubmit={upload}>
        <label className="field">Image file<input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
        <label className="field">Alt text<input name="altText" /></label>
        <label className="field">Folder<input name="folder" placeholder="Library, Case Studies, Team" /></label>
        <button type="submit"><Upload size={18} /> Upload</button>
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
          <div className="card" key={item._id}>
            <strong>{item.originalName}</strong>
            <p>{item.altText || "Missing alt text"}</p>
            <p className="meta">{item.folder || "Library"} · {item.mimeType} · {item.width || "?"}x{item.height || "?"} · {altScore(item)}</p>
          </div>
        ))}
      </section>
    </AdminShell>
  );
}
