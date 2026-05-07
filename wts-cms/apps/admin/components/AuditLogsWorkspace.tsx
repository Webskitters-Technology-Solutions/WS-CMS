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
import { RefreshCw } from "lucide-react";
import { AdminShell } from "./AdminShell";
import { adminApi } from "../lib/api";

interface AuditChange {
  field: string;
  before: unknown;
  after: unknown;
}

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  metadata?: {
    changes?: AuditChange[];
  };
}

function preview(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text && text.length > 120 ? `${text.slice(0, 120)}...` : text || "empty";
}

export function AuditLogsWorkspace() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const data = await adminApi("/api/audit-logs?limit=50");
      setItems(Array.isArray(data) ? data : []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load audit logs");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <AdminShell title="Audit Logs">
      <section className="panel">
        <div className="toolbar">
          <h2>Recent admin activity</h2>
          <button className="ghost" type="button" onClick={() => void load()}>
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
        {message ? <p className="meta">{message}</p> : null}
        <table>
          <thead>
            <tr><th>Action</th><th>Resource</th><th>When</th><th>Changes</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.action}</td>
                <td>{item.resource}</td>
                <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : "Recently"}</td>
                <td>
                  {item.metadata?.changes?.length ? (
                    <details>
                      <summary>{item.metadata.changes.length} field change(s)</summary>
                      {item.metadata.changes.map((change) => (
                        <p className="meta" key={change.field}>
                          <strong>{change.field}</strong>: {preview(change.before)} → {preview(change.after)}
                        </p>
                      ))}
                    </details>
                  ) : (
                    "No diff"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AdminShell>
  );
}
