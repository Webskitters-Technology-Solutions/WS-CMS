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
import { Edit3, Save, Search, Trash2 } from "lucide-react";
import { adminApi } from "../lib/api";
import { AdminTextEditor } from "./AdminTextEditor";

interface Field {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "json";
  options?: string[];
}

export function ResourceManager({ endpoint, fields }: { endpoint: string; fields: Field[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [editingId, setEditingId] = useState("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const canMutate = fields.length > 0;

  async function load() {
    const data = await adminApi(`${endpoint}?search=${encodeURIComponent(search)}`);
    setItems(Array.isArray(data) ? data : data || []);
  }

  useEffect(() => {
    void load().catch((error) => setMessage(error.message));
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    try {
      const jsonFieldNames = new Set(fields.filter((field) => field.type === "json").map((field) => field.name));
      const body = Object.fromEntries(
        Object.entries(form).map(([key, value]) => [
          key,
          jsonFieldNames.has(key) && typeof value === "string" ? JSON.parse(value || "{}") : value
        ])
      );
      await adminApi(editingId ? `${endpoint}/${editingId}` : endpoint, {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(body)
      });
      setForm({});
      setEditingId("");
      setMessage(editingId ? "Updated" : "Saved");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this WTS CMS record?")) {
      return;
    }
    await adminApi(`${endpoint}/${id}`, { method: "DELETE" });
    await load();
  }

  function edit(item: Record<string, any>) {
    setEditingId(item._id);
    setForm(
      Object.fromEntries(
        fields.map((field) => {
          const value = item[field.name];
          return [field.name, field.type === "json" && typeof value === "object" ? JSON.stringify(value || {}, null, 2) : value || ""];
        })
      )
    );
    setMessage("Editing selected WTS CMS record");
  }

  return (
    <div className="grid">
      <section className="panel">
        <div className="toolbar">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />
          <button className="ghost" onClick={() => void load()}>
            <Search size={18} /> Search
          </button>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Status</th><th>Details</th><th /></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title || item.name || item.email || item.source || item.action || item.filename}</td>
                <td>{item.status || item.location || item.resource || ""}</td>
                <td>{item.metadata?.changes?.length ? `${item.metadata.changes.length} field change(s)` : item.permalink || item.destination || ""}</td>
                <td>
                  {canMutate ? <button className="ghost" onClick={() => edit(item)}><Edit3 size={16} /></button> : null}
                  {canMutate ? <button className="danger" onClick={() => void remove(item._id)}><Trash2 size={16} /></button> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {canMutate ? (
        <form className="panel" onSubmit={save}>
          <h2>{editingId ? "Edit record" : "Create record"}</h2>
          {fields.map((field) => (
            <label className="field" key={field.name}>
              {field.label}
              {field.type === "textarea" || field.type === "json" ? (
                <AdminTextEditor
                  mode={field.type === "json" ? "code" : "rich"}
                  value={form[field.name] || ""}
                  onChange={(value) => setForm({ ...form, [field.name]: value })}
                />
              ) : field.type === "select" ? (
                <select value={form[field.name] || ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}>
                  <option value="">Select</option>
                  {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input value={form[field.name] || ""} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />
              )}
            </label>
          ))}
          {message ? <p className="meta">{message}</p> : null}
          <button type="submit"><Save size={18} /> {editingId ? "Update" : "Save"}</button>
          {editingId ? <button type="button" className="ghost" onClick={() => { setEditingId(""); setForm({}); }}>Cancel edit</button> : null}
        </form>
      ) : null}
    </div>
  );
}
