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
import { FileText, Globe2, Save, Search, ShieldCheck, Tags } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { AdminTextEditor } from "../../components/AdminTextEditor";
import { adminApi } from "../../lib/api";

type SeoPanel = "appearance" | "contentTypes" | "taxonomy" | "crawl" | "schema";

const crawlControls = [
  "Remove shortlink headers",
  "Hide REST discovery links",
  "Remove RSD and WLW links",
  "Disable oEmbed discovery links",
  "Strip generator metadata",
  "Reduce attachment URL noise"
];

export default function SeoSettingsAdmin() {
  const [settings, setSettings] = useState<any>({});
  const [audit, setAudit] = useState<any>(null);
  const [panel, setPanel] = useState<SeoPanel>("appearance");
  const [message, setMessage] = useState("");
  const [crawlState, setCrawlState] = useState<Record<string, boolean>>(
    Object.fromEntries(crawlControls.map((control) => [control, true]))
  );
  const [contentVisibility, setContentVisibility] = useState({
    pages: true,
    blogs: true,
    categories: true,
    tags: true,
    locations: true
  });

  useEffect(() => {
    adminApi("/api/settings").then(setSettings).catch(() => undefined);
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await adminApi("/api/settings", {
      method: "PATCH",
      body: JSON.stringify({
        ...settings,
        seoAdminPreferences: {
          contentVisibility,
          crawlOptimization: crawlState,
          poweredBy: "Webskitters Technology Solutions Pvt. Ltd."
        }
      })
    });
    setMessage("SEO settings saved");
  }

  async function runAudit() {
    const data = await adminApi("/api/seo/audit");
    setAudit(data);
    setMessage("SEO audit refreshed");
  }

  return (
    <AdminShell title="SEO Settings">
      <form className="seo-workspace" onSubmit={save}>
        <aside className="seo-settings-nav">
          <div className="seo-settings-brand">
            <strong>WTS SEO</strong>
            <span>Powered by Webskitters</span>
          </div>
          {[
            { key: "appearance", label: "Search appearance", icon: Search },
            { key: "contentTypes", label: "Content types", icon: FileText },
            { key: "taxonomy", label: "Categories & tags", icon: Tags },
            { key: "crawl", label: "Crawl optimization", icon: ShieldCheck },
            { key: "schema", label: "Schema & identity", icon: Globe2 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={panel === item.key ? "active" : ""}
                key={item.key}
                type="button"
                onClick={() => setPanel(item.key as SeoPanel)}
              >
                <Icon size={17} /> {item.label}
              </button>
            );
          })}
        </aside>

        <section className="seo-settings-main">
          <div className="seo-settings-header">
            <div>
              <span className="cms-kicker">Site wide SEO controls</span>
              <h2>{panelTitle(panel)}</h2>
              <p>Configure how WTS CMS content appears in search engines, social previews, and structured data.</p>
            </div>
            <button className="cms-primary-button" type="submit">
              <Save size={16} /> Save settings
            </button>
            <button className="cms-ghost-button" type="button" onClick={() => void runAudit()}>
              <Search size={16} /> Run audit
            </button>
          </div>

          {audit ? (
            <div className="seo-settings-card">
              <div className="seo-two-column">
                <div>
                  <h3>SEO tests</h3>
                  <p>Broken links, orphan pages, and metadata gaps across published WTS CMS content.</p>
                </div>
                <div className="seo-form-stack">
                  <p><strong>{audit.brokenInternalLinks?.length || 0}</strong> broken internal links</p>
                  <p><strong>{audit.orphanPages?.length || 0}</strong> orphan pages</p>
                  <p><strong>{audit.metadataGaps?.length || 0}</strong> metadata gaps</p>
                </div>
              </div>
            </div>
          ) : null}

          {panel === "appearance" ? (
            <div className="seo-settings-card">
              <div className="seo-two-column">
                <div>
                  <h3>Default search snippet</h3>
                  <p>Used when an individual page does not define custom metadata.</p>
                </div>
                <div className="seo-form-stack">
                  <label className="cms-field">
                    <span>Default meta title</span>
                    <input
                      value={settings.defaultMetaTitle || ""}
                      onChange={(event) => setSettings({ ...settings, defaultMetaTitle: event.target.value })}
                    />
                  </label>
                  <label className="cms-field">
                    <span>Default meta description</span>
                    <AdminTextEditor
                      mode="plain"
                      value={settings.defaultMetaDescription || ""}
                      onChange={(value) => setSettings({ ...settings, defaultMetaDescription: value })}
                    />
                  </label>
                  <label className="cms-field">
                    <span>Default OG image</span>
                    <input
                      value={settings.defaultOgImage || ""}
                      onChange={(event) => setSettings({ ...settings, defaultOgImage: event.target.value })}
                    />
                  </label>
                  <div className="seo-settings-preview">
                    <strong>{settings.defaultMetaTitle || "WTS CMS | Powered by Webskitters"}</strong>
                    <span>{settings.siteUrl || "https://example.com"}</span>
                    <p>{settings.defaultMetaDescription || "Default WTS CMS search description."}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {panel === "contentTypes" ? (
            <div className="seo-settings-card">
              {Object.entries(contentVisibility).map(([key, enabled]) => (
                <SettingSwitch
                  checked={enabled}
                  description={`Allow ${key} to appear in search results and XML sitemap data by default.`}
                  key={key}
                  label={`Index ${key}`}
                  onChange={(checked) => setContentVisibility({ ...contentVisibility, [key]: checked })}
                />
              ))}
            </div>
          ) : null}

          {panel === "taxonomy" ? (
            <div className="seo-settings-card">
              <div className="seo-two-column">
                <div>
                  <h3>Category and tag pages</h3>
                  <p>Keep taxonomy pages indexable only when they contain useful editorial context.</p>
                </div>
                <div className="seo-form-stack">
                  <SettingSwitch
                    checked={contentVisibility.categories}
                    description="Include blog category archives in sitemap data."
                    label="Index categories"
                    onChange={(checked) => setContentVisibility({ ...contentVisibility, categories: checked })}
                  />
                  <SettingSwitch
                    checked={contentVisibility.tags}
                    description="Include tag archives in sitemap data."
                    label="Index tags"
                    onChange={(checked) => setContentVisibility({ ...contentVisibility, tags: checked })}
                  />
                </div>
              </div>
            </div>
          ) : null}

          {panel === "crawl" ? (
            <div className="seo-settings-card">
              <div className="seo-two-column">
                <div>
                  <h3>Crawl optimization</h3>
                  <p>Reduce low-value metadata and discovery links so crawlers focus on content that matters.</p>
                </div>
                <div className="seo-form-stack">
                  {crawlControls.map((control) => (
                    <SettingSwitch
                      checked={crawlState[control]}
                      description="Recommended for lightweight WTS CMS builds unless a plugin or integration requires it."
                      key={control}
                      label={control}
                      onChange={(checked) => setCrawlState({ ...crawlState, [control]: checked })}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {panel === "schema" ? (
            <div className="seo-settings-card">
              <div className="seo-two-column">
                <div>
                  <h3>Organization schema</h3>
                  <p>Define the default Organization JSON-LD used by the public website.</p>
                </div>
                <div className="seo-form-stack">
                  <label className="cms-field">
                    <span>Organization Schema JSON-LD</span>
                    <AdminTextEditor
                      mode="code"
                      value={settings.organisationSchema || ""}
                      onChange={(value) => setSettings({ ...settings, organisationSchema: value })}
                    />
                  </label>
                  <label className="cms-field">
                    <span>GTM container ID</span>
                    <input
                      value={settings.gtmContainerId || ""}
                      onChange={(event) => setSettings({ ...settings, gtmContainerId: event.target.value })}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {message ? <p className="page-list-message">{message}</p> : null}
        </section>
      </form>
    </AdminShell>
  );
}

function panelTitle(panel: SeoPanel) {
  return {
    appearance: "Search appearance",
    contentTypes: "Content type visibility",
    taxonomy: "Taxonomy SEO",
    crawl: "Crawl optimization",
    schema: "Schema and identity"
  }[panel];
}

function SettingSwitch({
  checked,
  description,
  label,
  onChange
}: {
  checked?: boolean;
  description: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="seo-setting-switch">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input checked={Boolean(checked)} type="checkbox" onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
