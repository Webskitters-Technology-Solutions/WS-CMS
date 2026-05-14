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

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  BookOpen,
  ChevronDown,
  DatabaseBackup,
  FileText,
  FolderTree,
  Image,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  ListTree,
  LogOut,
  MapPin,
  Search,
  Settings,
  Shield,
  SquarePen,
  Tags,
  Users
} from "lucide-react";
import { adminApi, clearAdminSession, hasAdminSession, isAdminAuthError } from "../lib/api";

const navGroups = [
  {
    id: "workspace",
    label: "Workspace",
    items: [{ href: "/dashboard", label: "Dashboard", permission: "auth:read", icon: LayoutDashboard }]
  },
  {
    id: "content",
    label: "Content",
    items: [
      { href: "/pages", label: "Pages", permission: "pages:read", icon: FileText },
      { href: "/blogs", label: "Blog Posts", permission: "blogs:read", icon: BookOpen },
      { href: "/categories", label: "Categories", permission: "categories:read", icon: FolderTree },
      { href: "/tags", label: "Tags", permission: "tags:read", icon: Tags },
      { href: "/menus", label: "Menus", permission: "menus:read", icon: ListTree },
      { href: "/media", label: "Media", permission: "media:read", icon: Image }
    ]
  },
  {
    id: "engagement",
    label: "Engagement",
    items: [
      { href: "/forms", label: "Forms", permission: "forms:read", icon: SquarePen },
      { href: "/form-submissions", label: "Submissions", permission: "forms:read", icon: Inbox },
      { href: "/notifications", label: "Notifications", permission: "notifications:read", icon: Bell }
    ]
  },
  {
    id: "growth",
    label: "Growth & SEO",
    items: [
      { href: "/redirects", label: "Redirects", permission: "redirects:read", icon: Link2 },
      { href: "/locations", label: "Locations", permission: "locations:read", icon: MapPin },
      { href: "/seo-settings", label: "SEO Settings", permission: "seo:read", icon: Search },
      { href: "/global-search", label: "Global Search", permission: "search:read", icon: Search }
    ]
  },
  {
    id: "admin",
    label: "Administration",
    items: [
      { href: "/users", label: "Users", permission: "users:read", icon: Users },
      { href: "/roles", label: "Roles", permission: "roles:read", icon: Shield },
      { href: "/sessions", label: "Sessions", permission: "sessions:read", icon: KeyRound },
      { href: "/audit-logs", label: "Audit Logs", permission: "auditLogs:read", icon: Activity }
    ]
  },
  {
    id: "system",
    label: "System",
    items: [
      { href: "/site-settings", label: "Site Settings", permission: "settings:read", icon: Settings },
      { href: "/import-export", label: "Import Export", permission: "settings:read", icon: DatabaseBackup }
    ]
  }
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [sessionMessage, setSessionMessage] = useState("");
  const [openGroups, setOpenGroups] = useState<string[]>(["workspace"]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    if (!hasAdminSession()) {
      router.replace("/login");
      return;
    }
    adminApi("/api/auth/me")
      .then((me) => {
        setUser(me);
        setPermissions(me.permissions || []);
      })
      .catch((error) => {
        if (isAdminAuthError(error)) {
          router.replace("/login");
          return;
        }
        setSessionMessage(error instanceof Error ? error.message : "Unable to verify admin session");
      });
  }, [router]);

  useEffect(() => {
    const activeGroup = navGroups.find((group) => group.items.some((item) => item.href === pathname));
    if (!activeGroup) {
      return;
    }
    setOpenGroups((current) => (current.includes(activeGroup.id) ? current : [...current, activeGroup.id]));
  }, [pathname]);

  function logout() {
    clearAdminSession();
    router.replace("/login");
  }

  function toggleGroup(groupId: string) {
    setOpenGroups((current) =>
      current.includes(groupId) ? current.filter((id) => id !== groupId) : [...current, groupId]
    );
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-logo-wrap">
          <img src="/ws-cms-logo.png" alt="WTS CMS" className="sidebar-logo" />
        </div>
        <h2 className="sr-only">WTS CMS</h2>
        <div className="sidebar-credit">Powered by Webskitters Technology Solutions Pvt. Ltd.</div>
        <nav className="sidebar-nav" aria-label="WTS CMS admin sections" suppressHydrationWarning>
          {!isHydrated ? (
            <div className="sidebar-nav-loading" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          ) : (
            navGroups.map((group) => {
              const items = group.items.filter((item) => permissions.includes(item.permission));
              if (items.length === 0) {
                return null;
              }
              const isOpen = openGroups.includes(group.id);
              const hasActiveItem = items.some((item) => item.href === pathname);
              return (
                <section className="sidebar-accordion" key={group.id}>
                  <button
                    aria-expanded={isOpen}
                    className={hasActiveItem ? "active" : ""}
                    onClick={() => toggleGroup(group.id)}
                    type="button"
                  >
                    <span>{group.label}</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                  <div className="sidebar-accordion-panel" hidden={!isOpen}>
                    {items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                          <Icon size={18} /> {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <h1>{title}</h1>
            <p className="meta">Webskitters Technology Solutions admin management</p>
            {sessionMessage ? <p className="meta">{sessionMessage}</p> : null}
          </div>
          <button className="ghost" onClick={logout}>
            <LogOut size={18} /> Logout {user?.firstName || ""}
          </button>
        </div>
        {children}
        <p className="meta">Powered by Webskitters Technology Solutions Pvt. Ltd.</p>
      </main>
    </div>
  );
}
