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

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Edit3,
  Eye,
  Filter,
  Layers3,
  LockKeyhole,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  Users
} from "lucide-react";
import { AdminShell } from "./AdminShell";
import { AdminTextEditor } from "./AdminTextEditor";
import { adminApi } from "../lib/api";

interface Permission {
  _id: string;
  key: string;
  resource: string;
  action: string;
  description?: string;
  isSystem?: boolean;
}

interface Role {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  permissions: string[];
  isSystem?: boolean;
  updatedAt?: string;
}

interface RoleForm {
  id: string;
  name: string;
  slug: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

const ACTION_ORDER = ["read", "create", "update", "delete", "publish"] as const;

const ROLE_PROFILES: Record<string, { level: string; purpose: string; responsibilities: string[] }> = {
  "super-admin": {
    level: "Platform authority",
    purpose: "Owns every WTS CMS capability across content, people, security, SEO, and settings.",
    responsibilities: ["Manage system roles", "Assign highest access", "Recover platform configuration", "Review critical activity"]
  },
  admin: {
    level: "Site authority",
    purpose: "Runs day-to-day administration without deleting protected system roles.",
    responsibilities: ["Manage users", "Configure CMS features", "Publish and maintain content", "Control redirects and settings"]
  },
  editor: {
    level: "Editorial authority",
    purpose: "Owns publishing workflows, SEO quality, media, menus, and structured content.",
    responsibilities: ["Create and publish pages", "Maintain blogs and taxonomy", "Review SEO metadata", "Manage reusable media"]
  },
  author: {
    level: "Content contributor",
    purpose: "Creates editorial content and media while leaving broader site controls untouched.",
    responsibilities: ["Draft blog posts", "Upload supporting media", "Maintain own article quality", "Prepare content for review"]
  },
  viewer: {
    level: "Read-only observer",
    purpose: "Reviews CMS information without making operational changes.",
    responsibilities: ["Inspect content", "Review configuration", "Audit published material", "Support approval workflows"]
  }
};

const RESOURCE_LABELS: Record<string, string> = {
  auditLogs: "Audit logs",
  auth: "Authentication",
  blogs: "Blog posts",
  categories: "Categories",
  locations: "Locations",
  media: "Media library",
  menus: "Menus",
  pages: "CMS pages",
  permissions: "Permissions",
  redirects: "Redirects",
  roles: "Roles",
  seo: "SEO",
  settings: "Settings",
  tags: "Tags",
  users: "Users"
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function roleProfile(role: Pick<Role, "slug" | "name" | "permissions">) {
  return (
    ROLE_PROFILES[role.slug] || {
      level: "Custom responsibility set",
      purpose: `${role.name || "This role"} uses a tailored permission set for a specific Webskitters project workflow.`,
      responsibilities: ["Assign only the permissions needed", "Review access after project changes", "Keep responsibilities documented"]
    }
  );
}

function roleCoverage(role: Pick<Role, "permissions">, permissions: Permission[]) {
  if (!permissions.length) {
    return 0;
  }
  return Math.round((role.permissions.length / permissions.length) * 100);
}

function formFromRole(role?: Role | null): RoleForm {
  return {
    id: role?._id || "",
    name: role?.name || "",
    slug: role?.slug || "",
    description: role?.description || "",
    permissions: role?.permissions || [],
    isSystem: Boolean(role?.isSystem)
  };
}

export function RolesWorkspace() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [form, setForm] = useState<RoleForm>(formFromRole());
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const sortedRoles = useMemo(() => {
    return [...roles].sort((a, b) => {
      const aCoverage = roleCoverage(a, permissions);
      const bCoverage = roleCoverage(b, permissions);
      return bCoverage - aCoverage || a.name.localeCompare(b.name);
    });
  }, [permissions, roles]);

  const selectedRole = useMemo(() => roles.find((role) => role._id === selectedRoleId) || null, [roles, selectedRoleId]);
  const selectedProfile = useMemo(() => roleProfile(form), [form]);
  const groupedPermissions = useMemo(() => {
    const groups = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
      acc[permission.resource] = [...(acc[permission.resource] || []), permission];
      return acc;
    }, {});
    return Object.entries(groups)
      .filter(([resource]) => resourceFilter === "all" || resource === resourceFilter)
      .filter(([resource, items]) => {
        const searchable = `${RESOURCE_LABELS[resource] || resource} ${items.map((item) => item.key).join(" ")}`.toLowerCase();
        return searchable.includes(search.toLowerCase());
      })
      .sort(([a], [b]) => (RESOURCE_LABELS[a] || a).localeCompare(RESOURCE_LABELS[b] || b));
  }, [permissions, resourceFilter, search]);
  const availableResources = useMemo(() => {
    return Array.from(new Set(permissions.map((permission) => permission.resource))).sort((a, b) =>
      (RESOURCE_LABELS[a] || a).localeCompare(RESOURCE_LABELS[b] || b)
    );
  }, [permissions]);
  const activePermissionSet = useMemo(() => new Set(form.permissions), [form.permissions]);
  const coverage = useMemo(() => roleCoverage({ permissions: form.permissions }, permissions), [form.permissions, permissions]);

  async function loadAccessModel() {
    setLoading(true);
    setMessage("");
    try {
      const [roleData, permissionData] = await Promise.all([adminApi("/api/roles?limit=100"), adminApi("/api/permissions")]);
      const nextRoles = Array.isArray(roleData) ? roleData : [];
      const nextPermissions = Array.isArray(permissionData) ? permissionData : [];
      setRoles(nextRoles);
      setPermissions(nextPermissions);
      const nextSelected = nextRoles.find((role) => role._id === selectedRoleId) || nextRoles[0] || null;
      setSelectedRoleId(nextSelected?._id || "");
      setForm(formFromRole(nextSelected));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load roles and permissions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccessModel();
  }, []);

  function selectRole(role: Role) {
    setSelectedRoleId(role._id);
    setForm(formFromRole(role));
    setMessage("");
  }

  function startNewRole() {
    setSelectedRoleId("");
    setForm({
      id: "",
      name: "Custom Editorial Role",
      slug: "custom-editorial-role",
      description: "Custom WTS CMS responsibility set for a smaller Webskitters project team.",
      permissions: [],
      isSystem: false
    });
    setMessage("Create a custom role by selecting the permissions it needs.");
  }

  function duplicateRole() {
    setSelectedRoleId("");
    setForm((current) => ({
      ...current,
      id: "",
      name: `${current.name || "Role"} Copy`,
      slug: slugify(`${current.slug || current.name || "role"} copy`),
      isSystem: false
    }));
    setMessage("Role duplicated locally. Save it to create a new custom role.");
  }

  function updateName(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: current.id ? current.slug : slugify(value)
    }));
  }

  function togglePermission(key: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(key)
        ? current.permissions.filter((permission) => permission !== key)
        : [...current.permissions, key].sort()
    }));
  }

  function toggleResource(resource: string, checked: boolean) {
    const resourceKeys = permissions.filter((permission) => permission.resource === resource).map((permission) => permission.key);
    setForm((current) => {
      const next = new Set(current.permissions);
      resourceKeys.forEach((key) => {
        if (checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
      });
      return { ...current, permissions: Array.from(next).sort() };
    });
  }

  function applyPreset(preset: "viewer" | "author" | "editor" | "admin" | "super-admin") {
    const keys = permissions.map((permission) => permission.key);
    const nextPermissions = {
      viewer: keys.filter((key) => key.endsWith(":read") || key === "auditLogs:read"),
      author: keys.filter((key) => /^(blogs|media):/.test(key) || key === "auth:read"),
      editor: keys.filter((key) => /^(pages|blogs|categories|tags|menus|media|seo|settings):/.test(key)),
      admin: keys.filter((key) => !["roles:delete", "auditLogs:read"].includes(key)),
      "super-admin": keys
    }[preset];
    setForm((current) => ({ ...current, permissions: nextPermissions.sort() }));
    setMessage(`Applied ${preset.replace("-", " ")} responsibility preset.`);
  }

  async function saveRole() {
    if (!form.name.trim()) {
      setMessage("Role name is required.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const body = {
        name: form.name.trim(),
        slug: slugify(form.slug || form.name),
        description: form.description,
        permissions: form.permissions
      };
      const role = form.id
        ? await adminApi(`/api/roles/${form.id}`, { method: "PATCH", body: JSON.stringify(body) })
        : await adminApi("/api/roles", { method: "POST", body: JSON.stringify(body) });
      setMessage(form.id ? "Role updated" : "Role created");
      await loadAccessModel();
      setSelectedRoleId(role._id);
      setForm(formFromRole(role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save role");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRole(role: Role) {
    if (role.isSystem) {
      setMessage("System roles cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete the ${role.name} role? Users assigned to it should be moved first.`)) {
      return;
    }
    await adminApi(`/api/roles/${role._id}`, { method: "DELETE" });
    setMessage("Role deleted");
    await loadAccessModel();
  }

  return (
    <AdminShell title="Roles">
      <section className="roles-workspace">
        <div className="roles-hero">
          <div>
            <span className="cms-kicker">Access governance</span>
            <h2>Role management</h2>
            <p>
              Shape WTS CMS responsibilities by contribution level, authority scope, and API-backed permission checks.
            </p>
          </div>
          <div className="roles-hero-actions">
            <button className="cms-ghost-button" type="button" onClick={() => void loadAccessModel()}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="cms-primary-button" type="button" onClick={startNewRole}>
              <Plus size={16} /> New role
            </button>
          </div>
        </div>

        <div className="roles-overview-grid">
          {sortedRoles.slice(0, 5).map((role) => {
            const profile = roleProfile(role);
            const rolePercent = roleCoverage(role, permissions);
            return (
              <button
                className={`role-profile-card ${selectedRoleId === role._id ? "active" : ""}`}
                key={role._id}
                type="button"
                onClick={() => selectRole(role)}
              >
                <span className="role-profile-icon">
                  {role.slug === "super-admin" ? <LockKeyhole size={18} /> : <Shield size={18} />}
                </span>
                <strong>{role.name}</strong>
                <small>{profile.level}</small>
                <div className="role-progress" aria-label={`${rolePercent}% permission coverage`}>
                  <span style={{ width: `${rolePercent}%` }} />
                </div>
                <em>{role.permissions.length} permissions</em>
              </button>
            );
          })}
        </div>

        <div className="roles-layout">
          <aside className="roles-sidebar">
            <div className="roles-panel">
              <div className="roles-panel-title">
                <Users size={17} />
                <h3>Roles</h3>
              </div>
              <div className="role-search">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search roles or permissions" />
              </div>
              <div className="role-list">
                {sortedRoles.map((role) => {
                  const profile = roleProfile(role);
                  return (
                    <button
                      className={selectedRoleId === role._id ? "active" : ""}
                      key={role._id}
                      type="button"
                      onClick={() => selectRole(role)}
                    >
                      <span>
                        <strong>{role.name}</strong>
                        <small>{profile.level}</small>
                      </span>
                      {role.isSystem ? <LockKeyhole size={14} /> : <Edit3 size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="roles-panel">
              <div className="roles-panel-title">
                <Layers3 size={17} />
                <h3>Responsibility presets</h3>
              </div>
              <div className="role-preset-list">
                {(["viewer", "author", "editor", "admin", "super-admin"] as const).map((preset) => (
                  <button key={preset} type="button" onClick={() => applyPreset(preset)}>
                    {preset.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="roles-main">
            <div className="role-editor-card">
              <div className="role-editor-header">
                <div>
                  <span className="cms-kicker">{selectedProfile.level}</span>
                  <h2>{form.name || "New role"}</h2>
                  <p>{selectedProfile.purpose}</p>
                </div>
                <div className="role-editor-actions">
                  <button className="cms-ghost-button" type="button" onClick={duplicateRole}>
                    <Copy size={16} /> Duplicate
                  </button>
                  {selectedRole ? (
                    <button
                      className="cms-ghost-button danger"
                      type="button"
                      disabled={selectedRole.isSystem}
                      onClick={() => void deleteRole(selectedRole)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  ) : null}
                  <button className="cms-primary-button" type="button" disabled={saving} onClick={() => void saveRole()}>
                    <Save size={16} /> Save role
                  </button>
                </div>
              </div>

              <div className="role-form-grid">
                <label className="cms-field">
                  <span>Role name</span>
                  <input value={form.name} onChange={(event) => updateName(event.target.value)} placeholder="Example: Content Reviewer" />
                </label>
                <label className="cms-field">
                  <span>Slug</span>
                  <input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} />
                </label>
                <label className="cms-field role-description-field">
                  <span>Responsibilities summary</span>
                  <AdminTextEditor
                    mode="plain"
                    minHeight={90}
                    value={form.description}
                    onChange={(value) => setForm((current) => ({ ...current, description: value }))}
                    placeholder="Explain what this role is accountable for."
                  />
                </label>
              </div>

              <div className="role-responsibility-grid">
                <div className="role-score-card">
                  <ShieldCheck size={20} />
                  <strong>{coverage}%</strong>
                  <span>Permission coverage</span>
                </div>
                <div className="role-score-card">
                  <CheckCircle2 size={20} />
                  <strong>{form.permissions.length}</strong>
                  <span>Assigned permissions</span>
                </div>
                <div className="role-score-card">
                  <Eye size={20} />
                  <strong>{groupedPermissions.length}</strong>
                  <span>Visible resources</span>
                </div>
              </div>

              <div className="role-responsibilities">
                {selectedProfile.responsibilities.map((item) => (
                  <span key={item}>
                    <CheckCircle2 size={14} /> {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="role-matrix-card">
              <div className="role-matrix-toolbar">
                <div>
                  <span className="cms-kicker">Permission graph</span>
                  <h2>Resource access matrix</h2>
                </div>
                <div className="role-matrix-filters">
                  <Filter size={16} />
                  <select value={resourceFilter} onChange={(event) => setResourceFilter(event.target.value)}>
                    <option value="all">All resources</option>
                    {availableResources.map((resource) => (
                      <option key={resource} value={resource}>
                        {RESOURCE_LABELS[resource] || resource}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="role-matrix-scroll">
                <table className="role-matrix">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      {ACTION_ORDER.map((action) => (
                        <th key={action}>{action}</th>
                      ))}
                      <th>All</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedPermissions.map(([resource, items]) => {
                      const itemByAction = new Map(items.map((item) => [item.action, item]));
                      const allChecked = items.every((item) => activePermissionSet.has(item.key));
                      return (
                        <tr key={resource}>
                          <td>
                            <strong>{RESOURCE_LABELS[resource] || resource}</strong>
                            <span>{items.length} permission{items.length === 1 ? "" : "s"}</span>
                          </td>
                          {ACTION_ORDER.map((action) => {
                            const permission = itemByAction.get(action);
                            return (
                              <td key={action}>
                                {permission ? (
                                  <label className="role-permission-check" title={permission.description || permission.key}>
                                    <input
                                      type="checkbox"
                                      checked={activePermissionSet.has(permission.key)}
                                      onChange={() => togglePermission(permission.key)}
                                    />
                                    <span>{permission.key}</span>
                                  </label>
                                ) : (
                                  <span className="role-matrix-empty">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td>
                            <label className="role-permission-check compact">
                              <input type="checkbox" checked={allChecked} onChange={(event) => toggleResource(resource, event.target.checked)} />
                              <span>All</span>
                            </label>
                          </td>
                        </tr>
                      );
                    })}
                    {!groupedPermissions.length ? (
                      <tr>
                        <td colSpan={ACTION_ORDER.length + 2}>
                          <div className="page-empty-state">
                            <Shield size={28} />
                            <strong>{loading ? "Loading permissions..." : "No permissions found"}</strong>
                            <span>Adjust the search or resource filter.</span>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>

        {message ? <p className="page-list-message">{message}</p> : null}
      </section>
    </AdminShell>
  );
}
