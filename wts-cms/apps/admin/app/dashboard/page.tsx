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

import Link from "next/link";
import type { ComponentType } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Gauge,
  Globe2,
  Link2,
  ListTree,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users
} from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi } from "../../lib/api";

interface CmsEntity {
  _id: string;
  title?: string;
  name?: string;
  status?: string;
  updatedAt?: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    robotsIndex?: boolean;
  };
}

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  createdAt?: string;
}

const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function publishedCount(items: CmsEntity[]) {
  return items.filter((item) => item.status === "published").length;
}

function seoReadyCount(items: CmsEntity[]) {
  return items.filter((item) => item.seo?.robotsIndex !== false && (item.seo?.metaTitle || item.title || item.name) && item.seo?.metaDescription)
    .length;
}

function formatTime(value?: string) {
  if (!value) {
    return "Recently";
  }
  return new Date(value).toLocaleString();
}

export default function DashboardPage() {
  const [pages, setPages] = useState<CmsEntity[]>([]);
  const [blogs, setBlogs] = useState<CmsEntity[]>([]);
  const [users, setUsers] = useState<CmsEntity[]>([]);
  const [redirects, setRedirects] = useState<CmsEntity[]>([]);
  const [menus, setMenus] = useState<CmsEntity[]>([]);
  const [media, setMedia] = useState<CmsEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setMessage("");
    try {
      const [pageData, blogData, userData, redirectData, menuData, mediaData, auditData] = await Promise.all([
        adminApi("/api/pages?limit=100"),
        adminApi("/api/blogs?limit=100"),
        adminApi("/api/users?limit=100"),
        adminApi("/api/redirects?limit=100"),
        adminApi("/api/menus?limit=100"),
        adminApi("/api/media?limit=100"),
        adminApi("/api/audit-logs?limit=5")
      ]);
      setPages(Array.isArray(pageData) ? pageData : []);
      setBlogs(Array.isArray(blogData) ? blogData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setRedirects(Array.isArray(redirectData) ? redirectData : []);
      setMenus(Array.isArray(menuData) ? menuData : []);
      setMedia(Array.isArray(mediaData) ? mediaData : []);
      setAuditLogs(Array.isArray(auditData) ? auditData : []);
      setMessage("Dashboard refreshed");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const contentTotal = pages.length + blogs.length;
    const publishedTotal = publishedCount(pages) + publishedCount(blogs);
    const seoReady = seoReadyCount([...pages, ...blogs]);
    const seoPercent = contentTotal ? Math.round((seoReady / contentTotal) * 100) : 0;
    return {
      contentTotal,
      publishedTotal,
      seoReady,
      seoPercent,
      users: users.length,
      redirects: redirects.length,
      menus: menus.length,
      media: media.length
    };
  }, [blogs, media.length, menus.length, pages, redirects.length, users.length]);

  const contentBars = useMemo(() => {
    const base = [pages.length, blogs.length, media.length, menus.length, redirects.length, users.length, auditLogs.length];
    const max = Math.max(...base, 1);
    return base.map((value, index) => ({
      day: chartDays[index] || "Day",
      value,
      height: Math.max(18, Math.round((value / max) * 190))
    }));
  }, [auditLogs.length, blogs.length, media.length, menus.length, pages.length, redirects.length, users.length]);

  const seoBars = useMemo(() => {
    const values = [
      seoReadyCount(pages),
      pages.length - seoReadyCount(pages),
      seoReadyCount(blogs),
      blogs.length - seoReadyCount(blogs),
      publishedCount(pages),
      publishedCount(blogs),
      redirects.length
    ];
    const max = Math.max(...values, 1);
    return values.map((value, index) => ({
      day: chartDays[index] || "Day",
      value,
      height: Math.max(18, Math.round((value / max) * 190))
    }));
  }, [blogs, pages, redirects.length]);

  const healthItems = [
    { label: "API and admin auth", value: "Operational", tone: "good" },
    { label: "SEO metadata coverage", value: `${metrics.seoPercent}% ready`, tone: metrics.seoPercent >= 70 ? "good" : "warn" },
    { label: "Redirect coverage", value: `${metrics.redirects} rules`, tone: "good" },
    { label: "Navigation locations", value: `${metrics.menus} menus`, tone: metrics.menus ? "good" : "warn" }
  ];

  return (
    <AdminShell title="Dashboard">
      <section className="dashboard-workspace">
        <div className="dashboard-hero">
          <div>
            <span className="cms-kicker">WTS CMS command center</span>
            <h2>Dashboard</h2>
            <p>Monitor content throughput, SEO readiness, users, redirects, and recent admin activity.</p>
          </div>
          <div className="dashboard-hero-actions">
            <Link className="cms-ghost-button" href="/pages">
              <Plus size={16} /> Create page
            </Link>
            <button className="cms-primary-button" type="button" disabled={loading} onClick={() => void loadDashboard()}>
              <RefreshCw size={16} /> Refresh metrics
            </button>
          </div>
        </div>

        <div className="dashboard-kpi-grid">
          <MetricCard icon={FileText} label="Content items" value={metrics.contentTotal} detail={`${metrics.publishedTotal} published`} tone="blue" />
          <MetricCard icon={Gauge} label="SEO readiness" value={`${metrics.seoPercent}%`} detail={`${metrics.seoReady} optimized`} tone="green" />
          <MetricCard icon={Users} label="Admin users" value={metrics.users} detail="RBAC controlled" tone="violet" />
          <MetricCard icon={Link2} label="Redirect rules" value={metrics.redirects} detail="301/302 managed" tone="orange" />
        </div>

        <div className="dashboard-layout">
          <aside className="dashboard-rail">
            <section className="dashboard-panel">
              <span className="cms-kicker">CMS operations</span>
              <nav className="dashboard-workflow-list">
                <Link href="/pages">
                  <FileText size={16} /> Pages <strong>{pages.length}</strong>
                </Link>
                <Link href="/blogs">
                  <BookOpen size={16} /> Blog posts <strong>{blogs.length}</strong>
                </Link>
                <Link href="/menus">
                  <ListTree size={16} /> Menus <strong>{menus.length}</strong>
                </Link>
                <Link href="/seo-settings">
                  <Search size={16} /> SEO settings <strong>{metrics.seoPercent}%</strong>
                </Link>
                <Link href="/roles">
                  <ShieldCheck size={16} /> Roles and access <strong>{users.length}</strong>
                </Link>
              </nav>
            </section>

            <section className="dashboard-panel">
              <span className="cms-kicker">Monitoring</span>
              <div className="dashboard-health-list">
                {healthItems.map((item) => (
                  <div className={`dashboard-health-item ${item.tone}`} key={item.label}>
                    <CheckCircle2 size={16} />
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </section>
          </aside>

          <main className="dashboard-main">
            <section className="dashboard-chart-grid">
              <ChartCard
                title="Content throughput"
                subtitle="Current CMS inventory"
                bars={contentBars}
                footer={[
                  { label: "Pages", value: pages.length },
                  { label: "Blogs", value: blogs.length },
                  { label: "Media", value: media.length }
                ]}
              />
              <ChartCard
                title="SEO and publishing"
                subtitle="Optimization coverage"
                bars={seoBars}
                footer={[
                  { label: "SEO ready", value: metrics.seoReady },
                  { label: "Published", value: metrics.publishedTotal },
                  { label: "Redirects", value: metrics.redirects }
                ]}
              />
            </section>

            <section className="dashboard-bottom-grid">
              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="cms-kicker">Recent activity</span>
                    <h2>Admin audit trail</h2>
                  </div>
                  <Link href="/audit-logs">
                    View all <ArrowUpRight size={15} />
                  </Link>
                </div>
                <div className="dashboard-activity-list">
                  {auditLogs.map((log) => (
                    <div className="dashboard-activity-item" key={log._id}>
                      <Activity size={16} />
                      <span>
                        <strong>{log.action}</strong>
                        <small>{log.resource} · {formatTime(log.createdAt)}</small>
                      </span>
                    </div>
                  ))}
                  {!auditLogs.length ? (
                    <div className="dashboard-empty-state">
                      <Activity size={24} />
                      <strong>No recent activity yet</strong>
                      <span>Audit logs will appear after admin actions.</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="dashboard-panel">
                <div className="dashboard-section-title">
                  <div>
                    <span className="cms-kicker">Public readiness</span>
                    <h2>Launch checklist</h2>
                  </div>
                  <Globe2 size={18} />
                </div>
                <div className="dashboard-checklist">
                  <CheckRow done={pages.length > 0} label="Home and CMS pages available" />
                  <CheckRow done={blogs.length > 0} label="Blog content created" />
                  <CheckRow done={menus.length > 0} label="Navigation menu configured" />
                  <CheckRow done={metrics.seoPercent >= 70} label="SEO metadata coverage healthy" />
                  <CheckRow done={redirects.length > 0} label="Redirect rules reviewed" />
                </div>
              </div>
            </section>
          </main>
        </div>

        {message ? <p className="page-list-message">{message}</p> : null}
      </section>
    </AdminShell>
  );
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value
}: {
  detail: string;
  icon: ComponentType<{ size?: number }>;
  label: string;
  tone: string;
  value: number | string;
}) {
  return (
    <div className={`dashboard-kpi-card ${tone}`}>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
      <Icon size={22} />
    </div>
  );
}

function ChartCard({
  bars,
  footer,
  subtitle,
  title
}: {
  bars: Array<{ day: string; value: number; height: number }>;
  footer: Array<{ label: string; value: number }>;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="dashboard-chart-card">
      <div className="dashboard-section-title">
        <div>
          <h2>{title}</h2>
          <span>{subtitle}</span>
        </div>
      </div>
      <div className="dashboard-chart" aria-label={title}>
        {bars.map((bar, index) => (
          <div className="dashboard-chart-bar" key={`${bar.day}-${index}`}>
            <span style={{ height: bar.height }} title={`${bar.value}`} />
            <small>{bar.day}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-chart-footer">
        {footer.map((item) => (
          <span key={item.label}>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className={`dashboard-check-row ${done ? "done" : ""}`}>
      <CheckCircle2 size={16} />
      <span>{label}</span>
    </div>
  );
}
