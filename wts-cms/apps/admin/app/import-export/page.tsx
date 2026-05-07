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

import { useMemo, useState } from "react";
import { Download, Upload } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { AdminTextEditor } from "../../components/AdminTextEditor";
import { adminApi } from "../../lib/api";

const resources = ["pages", "blogs", "categories", "tags", "menus", "redirects", "forms", "settings", "locations"];

export default function ImportExportAdmin() {
  const [selected, setSelected] = useState(resources);
  const [payload, setPayload] = useState("");
  const [mode, setMode] = useState<"upsert" | "replace">("upsert");
  const [message, setMessage] = useState("");
  const resourceQuery = useMemo(() => selected.join(","), [selected]);

  function toggle(resource: string) {
    setSelected((current) => (current.includes(resource) ? current.filter((item) => item !== resource) : [...current, resource]));
  }

  async function exportContent() {
    try {
      const data = await adminApi(`/api/import-export/export?resources=${resourceQuery}`);
      setPayload(JSON.stringify(data, null, 2));
      setMessage("Export generated from WTS CMS database content.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed");
    }
  }

  async function importContent() {
    try {
      const parsed = JSON.parse(payload || "{}");
      const resourcesPayload = parsed.resources || parsed;
      const data = await adminApi("/api/import-export/import", {
        method: "POST",
        body: JSON.stringify({ mode, resources: resourcesPayload })
      });
      setMessage(`Import complete: ${JSON.stringify(data.summary)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import failed");
    }
  }

  return (
    <AdminShell title="Import Export">
      <section className="panel import-export-hero">
        <div>
          <span className="cms-kicker">Portable content</span>
          <h2>Move WTS CMS content safely</h2>
          <p className="meta">
            Export and import editable Webskitters CMS content for pages, blogs, menus, redirects, forms, taxonomy, settings, and locations.
          </p>
        </div>
        <div className="page-list-actions">
          <button type="button" onClick={() => void exportContent()}>
            <Download size={18} /> Generate export
          </button>
          <button className="ghost" type="button" onClick={() => void importContent()}>
            <Upload size={18} /> Import JSON
          </button>
        </div>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <div className="resource-chip-grid">
          {resources.map((resource) => (
            <label className="cms-toggle" key={resource}>
              <input type="checkbox" checked={selected.includes(resource)} onChange={() => toggle(resource)} />
              {resource}
            </label>
          ))}
        </div>
        <label className="field">
          Import mode
          <select value={mode} onChange={(event) => setMode(event.target.value as "upsert" | "replace")}>
            <option value="upsert">Upsert by unique URL or slug</option>
            <option value="replace">Replace selected collections</option>
          </select>
        </label>
      </section>

      <section className="panel" style={{ marginTop: 16 }}>
        <label className="field">
          Content JSON
          <AdminTextEditor mode="code" minHeight={420} value={payload} onChange={setPayload} />
        </label>
        {message ? <p className="meta">{message}</p> : null}
      </section>
    </AdminShell>
  );
}
