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

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Edit3,
  Eye,
  Link2,
  ListTree,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2
} from "lucide-react";
import { AdminShell } from "./AdminShell";
import { adminApi } from "../lib/api";

type MenuLocation = "header" | "footer" | "sidebar" | "custom";
type MenuStatus = "active" | "inactive";
type MenuItemType = "page" | "blog" | "category" | "tag" | "location" | "custom";
type MenuTarget = "self" | "blank";
type MenuRel = "follow" | "nofollow";

interface MenuItem {
  id: string;
  label: string;
  type: MenuItemType;
  referenceId?: string;
  url: string;
  target: MenuTarget;
  rel: MenuRel;
  parent?: string;
  order: number;
  children?: MenuItem[];
}

interface Menu {
  _id: string;
  name: string;
  slug: string;
  location: MenuLocation;
  status?: MenuStatus;
  items: MenuItem[];
  updatedAt?: string;
}

interface MenuForm {
  id: string;
  name: string;
  slug: string;
  location: MenuLocation;
  status: MenuStatus;
  items: MenuItem[];
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeId() {
  return `menu-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formFromMenu(menu?: Menu | null): MenuForm {
  return {
    id: menu?._id || "",
    name: menu?.name || "Header Menu",
    slug: menu?.slug || "header-menu",
    location: menu?.location || "header",
    status: menu?.status || "active",
    items: menu?.items || []
  };
}

function countItems(items: MenuItem[]): number {
  return items.reduce((total, item) => total + 1 + countItems(item.children || []), 0);
}

function flattenItems(items: MenuItem[], depth = 0): Array<MenuItem & { depth: number }> {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .flatMap((item) => [{ ...item, depth }, ...flattenItems(item.children || [], depth + 1)]);
}

function updateNestedItems(items: MenuItem[], id: string, updater: (item: MenuItem) => MenuItem): MenuItem[] {
  return items.map((item) => {
    if (item.id === id) {
      return updater(item);
    }
    return { ...item, children: updateNestedItems(item.children || [], id, updater) };
  });
}

function removeNestedItem(items: MenuItem[], id: string): MenuItem[] {
  return items
    .filter((item) => item.id !== id)
    .map((item) => ({ ...item, children: removeNestedItem(item.children || [], id) }));
}

export function MenusWorkspace() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState("");
  const [form, setForm] = useState<MenuForm>(formFromMenu());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const flatItems = useMemo(() => flattenItems(form.items), [form.items]);
  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => `${menu.name} ${menu.slug} ${menu.location}`.toLowerCase().includes(search.toLowerCase()));
  }, [menus, search]);

  async function loadMenus() {
    setLoading(true);
    setMessage("");
    try {
      const data = await adminApi("/api/menus?limit=100");
      const nextMenus = Array.isArray(data) ? data : [];
      setMenus(nextMenus);
      const selected = nextMenus.find((menu) => menu._id === selectedMenuId) || nextMenus[0] || null;
      setSelectedMenuId(selected?._id || "");
      setForm(formFromMenu(selected));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load menus");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMenus();
  }, []);

  function selectMenu(menu: Menu) {
    setSelectedMenuId(menu._id);
    setForm(formFromMenu(menu));
    setMessage("");
  }

  function startNewMenu() {
    setSelectedMenuId("");
    setForm(formFromMenu(null));
    setMessage("Create a new menu and add links below.");
  }

  function duplicateMenu() {
    setSelectedMenuId("");
    setForm((current) => ({
      ...current,
      id: "",
      name: `${current.name || "Menu"} Copy`,
      slug: slugify(`${current.slug || current.name || "menu"} copy`)
    }));
    setMessage("Menu duplicated locally. Save it to create a new menu.");
  }

  function addMenuItem(parentId = "") {
    const nextItem: MenuItem = {
      id: makeId(),
      label: "New menu item",
      type: "custom",
      url: "/",
      target: "self",
      rel: "follow",
      parent: parentId,
      order: parentId ? 0 : form.items.length,
      children: []
    };
    if (!parentId) {
      setForm((current) => ({ ...current, items: [...current.items, nextItem] }));
      return;
    }
    setForm((current) => ({
      ...current,
      items: updateNestedItems(current.items, parentId, (item) => ({
        ...item,
        children: [...(item.children || []), { ...nextItem, order: item.children?.length || 0 }]
      }))
    }));
  }

  function updateMenuItem(id: string, patch: Partial<MenuItem>) {
    setForm((current) => ({
      ...current,
      items: updateNestedItems(current.items, id, (item) => ({ ...item, ...patch }))
    }));
  }

  function removeMenuItem(id: string) {
    setForm((current) => ({ ...current, items: removeNestedItem(current.items, id) }));
  }

  function moveRootItem(id: string, direction: -1 | 1) {
    const index = form.items.findIndex((item) => item.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= form.items.length) {
      return;
    }
    const nextItems = [...form.items];
    const [item] = nextItems.splice(index, 1);
    if (!item) {
      return;
    }
    nextItems.splice(nextIndex, 0, item);
    setForm((current) => ({
      ...current,
      items: nextItems.map((nextItem, order) => ({ ...nextItem, order }))
    }));
  }

  async function saveMenu() {
    if (!form.name.trim()) {
      setMessage("Menu name is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const body = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        location: form.location,
        status: form.status,
        items: form.items
      };
      const menu = form.id
        ? await adminApi(`/api/menus/${form.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : await adminApi("/api/menus", { method: "POST", body: JSON.stringify(body) });
      setMessage(form.id ? "Menu updated" : "Menu created");
      await loadMenus();
      setSelectedMenuId(menu._id);
      setForm(formFromMenu(menu));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save menu");
    } finally {
      setSaving(false);
    }
  }

  async function deleteMenu(menu: Menu) {
    if (!window.confirm(`Delete ${menu.name}?`)) {
      return;
    }
    await adminApi(`/api/menus/${menu._id}`, { method: "DELETE" });
    setMessage("Menu deleted");
    await loadMenus();
  }

  return (
    <AdminShell title="Menus">
      <section className="menus-workspace">
        <div className="menus-hero">
          <div>
            <span className="cms-kicker">Navigation builder</span>
            <h2>Menus</h2>
            <p>Build header, footer, sidebar, and custom navigation with nested WTS CMS links.</p>
          </div>
          <div className="menus-actions">
            <button className="cms-ghost-button" type="button" onClick={() => void loadMenus()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="cms-primary-button" type="button" onClick={startNewMenu}>
              <Plus size={16} /> New menu
            </button>
          </div>
        </div>

        <div className="menus-layout">
          <aside className="menus-sidebar">
            <div className="menus-panel">
              <div className="menus-search">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menus" />
              </div>
              <div className="menus-list">
                {filteredMenus.map((menu) => (
                  <button
                    className={selectedMenuId === menu._id ? "active" : ""}
                    key={menu._id}
                    type="button"
                    onClick={() => selectMenu(menu)}
                  >
                    <span>
                      <strong>{menu.name}</strong>
                      <small>{menu.location} · {countItems(menu.items || [])} items</small>
                    </span>
                    <Edit3 size={15} />
                  </button>
                ))}
                {!filteredMenus.length ? (
                  <div className="menus-empty">
                    <ListTree size={24} />
                    <strong>{loading ? "Loading menus..." : "No menus found"}</strong>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <main className="menus-main">
            <div className="menu-editor-card">
              <div className="menu-editor-header">
                <div>
                  <span className="cms-kicker">Menu settings</span>
                  <h2>{form.name || "New menu"}</h2>
                  <p>{flatItems.length} item{flatItems.length === 1 ? "" : "s"} assigned to {form.location}</p>
                </div>
                <div className="menus-actions">
                  <button className="cms-ghost-button" type="button" onClick={duplicateMenu}>
                    <Copy size={16} /> Duplicate
                  </button>
                  {selectedMenuId ? (
                    <button
                      className="cms-ghost-button danger"
                      type="button"
                      onClick={() => {
                        const menu = menus.find((item) => item._id === selectedMenuId);
                        if (menu) {
                          void deleteMenu(menu);
                        }
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : null}
                  <button className="cms-primary-button" type="button" disabled={saving} onClick={() => void saveMenu()}>
                    <Save size={16} /> Save menu
                  </button>
                </div>
              </div>

              <div className="menu-form-grid">
                <label className="cms-field">
                  <span>Name</span>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                        slug: current.id ? current.slug : slugify(event.target.value)
                      }))
                    }
                  />
                </label>
                <label className="cms-field">
                  <span>Slug</span>
                  <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
                </label>
                <label className="cms-field">
                  <span>Location</span>
                  <select value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value as MenuLocation }))}>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                    <option value="sidebar">Sidebar</option>
                    <option value="custom">Custom</option>
                  </select>
                </label>
                <label className="cms-field">
                  <span>Status</span>
                  <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as MenuStatus }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="menu-builder-card">
              <div className="menu-builder-header">
                <div>
                  <span className="cms-kicker">Menu items</span>
                  <h2>Navigation structure</h2>
                </div>
                <button className="cms-ghost-button" type="button" onClick={() => addMenuItem()}>
                  <Plus size={16} /> Add item
                </button>
              </div>

              <div className="menu-item-list">
                {flatItems.map((item) => {
                  const isRoot = item.depth === 0;
                  return (
                    <div className="menu-item-row" key={item.id} style={{ marginLeft: item.depth * 22 }}>
                      <div className="menu-item-row-main">
                        <ListTree size={17} />
                        <label>
                          <span>Label</span>
                          <input value={item.label} onChange={(event) => updateMenuItem(item.id, { label: event.target.value })} />
                        </label>
                        <label>
                          <span>Type</span>
                          <select value={item.type} onChange={(event) => updateMenuItem(item.id, { type: event.target.value as MenuItemType })}>
                            <option value="custom">Custom</option>
                            <option value="page">Page</option>
                            <option value="blog">Blog</option>
                            <option value="category">Category</option>
                            <option value="tag">Tag</option>
                            <option value="location">Location</option>
                          </select>
                        </label>
                        <label>
                          <span>URL</span>
                          <div className="cms-inline-input">
                            <Link2 size={15} />
                            <input value={item.url} onChange={(event) => updateMenuItem(item.id, { url: event.target.value })} />
                          </div>
                        </label>
                      </div>
                      <div className="menu-item-options">
                        <select value={item.target} aria-label="Target" onChange={(event) => updateMenuItem(item.id, { target: event.target.value as MenuTarget })}>
                          <option value="self">Same tab</option>
                          <option value="blank">New tab</option>
                        </select>
                        <select value={item.rel} aria-label="Rel" onChange={(event) => updateMenuItem(item.id, { rel: event.target.value as MenuRel })}>
                          <option value="follow">Follow</option>
                          <option value="nofollow">Nofollow</option>
                        </select>
                        <button type="button" aria-label="Add child item" onClick={() => addMenuItem(item.id)}>
                          <Plus size={15} />
                        </button>
                        {isRoot ? (
                          <>
                            <button type="button" aria-label="Move up" onClick={() => moveRootItem(item.id, -1)}>
                              <ArrowUp size={15} />
                            </button>
                            <button type="button" aria-label="Move down" onClick={() => moveRootItem(item.id, 1)}>
                              <ArrowDown size={15} />
                            </button>
                          </>
                        ) : null}
                        <button type="button" aria-label="Preview menu link" onClick={() => window.open(item.url || "/", "_blank", "noopener,noreferrer")}>
                          <Eye size={15} />
                        </button>
                        <button className="danger" type="button" aria-label="Remove menu item" onClick={() => removeMenuItem(item.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!flatItems.length ? (
                  <div className="menu-builder-empty">
                    <ListTree size={28} />
                    <strong>No menu items yet</strong>
                    <span>Add custom links or CMS references to build this navigation.</span>
                  </div>
                ) : null}
              </div>
            </div>
          </main>
        </div>

        {message ? <p className="page-list-message">{message}</p> : null}
      </section>
    </AdminShell>
  );
}
