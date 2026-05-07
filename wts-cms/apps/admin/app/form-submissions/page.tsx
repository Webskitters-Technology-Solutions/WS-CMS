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
import { CheckCircle2 } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi } from "../../lib/api";

export default function FormSubmissionsAdmin() {
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    setItems(await adminApi("/api/forms/submissions"));
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error.message));
  }, []);

  async function markRead(id: string) {
    await adminApi(`/api/forms/submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status: "read" }) });
    await load();
  }

  return (
    <AdminShell title="Form Submissions">
      <section className="panel">
        {message ? <p className="meta">{message}</p> : null}
        <table>
          <thead><tr><th>Form</th><th>Status</th><th>Values</th><th>Received</th><th /></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.form?.name || "WTS CMS form"}</td>
                <td>{item.status}</td>
                <td><pre>{JSON.stringify(item.values || {}, null, 2)}</pre></td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</td>
                <td><button className="ghost" onClick={() => void markRead(item._id)}><CheckCircle2 size={16} /> Read</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
