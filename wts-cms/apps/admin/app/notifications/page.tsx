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

import { useEffect, useState } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi } from "../../lib/api";

export default function NotificationsAdmin() {
  const [items, setItems] = useState<any[]>([]);

  async function load() {
    setItems(await adminApi("/api/notifications"));
  }

  useEffect(() => {
    void load();
  }, []);

  async function readAll() {
    await adminApi("/api/notifications/read-all", { method: "POST", body: JSON.stringify({}) });
    await load();
  }

  return (
    <AdminShell title="Notifications">
      <section className="panel">
        <div className="toolbar">
          <h2><Bell size={18} /> Activity Notifications</h2>
          <button className="ghost" onClick={() => void readAll()}><CheckCircle2 size={18} /> Mark all read</button>
        </div>
        <div className="grid">
          {items.map((item) => (
            <article className="card" key={item._id}>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              <p className="meta">{item.type} · {item.status}</p>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
