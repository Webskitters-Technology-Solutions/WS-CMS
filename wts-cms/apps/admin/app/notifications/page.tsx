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
