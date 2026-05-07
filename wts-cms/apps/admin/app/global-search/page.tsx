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

import { useState } from "react";
import { Search } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi } from "../../lib/api";

export default function GlobalSearchAdmin() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function search() {
    if (query.trim().length < 2) {
      setMessage("Type at least two characters");
      return;
    }
    setItems(await adminApi(`/api/search?q=${encodeURIComponent(query)}`));
    setMessage("");
  }

  return (
    <AdminShell title="Global Search">
      <section className="panel">
        <div className="toolbar">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pages, blogs, media, redirects" />
          <button onClick={() => void search()}><Search size={18} /> Search</button>
        </div>
        {message ? <p className="meta">{message}</p> : null}
        <div className="grid">
          {items.map((item, index) => (
            <article className="card" key={`${item.type}-${item.url}-${index}`}>
              <strong>{item.title}</strong>
              <p>{item.url}</p>
              <p className="meta">{item.type} · {item.status}</p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
