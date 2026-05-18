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
import { Save } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { AdminTextEditor } from "../../components/AdminTextEditor";
import { adminApi } from "../../lib/api";

export default function SiteSettingsAdmin() {
  const [settings, setSettings] = useState<any>({});
  const [message, setMessage] = useState("");
  useEffect(() => { adminApi("/api/settings").then(setSettings).catch((error) => setMessage(error.message)); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    await adminApi("/api/settings", { method: "PATCH", body: JSON.stringify(settings) });
    setMessage("Settings saved");
  }
  return (
    <AdminShell title="Site Settings">
      <form className="panel" onSubmit={save}>
        {["siteName", "siteUrl", "footerText", "poweredByText", "gtmContainerId"].map((key) => <label className="field" key={key}>{key}<input value={settings[key] || ""} onChange={(event) => setSettings({ ...settings, [key]: event.target.value })} /></label>)}
        <label className="field">
          robots.txt
          <AdminTextEditor mode="code" value={settings.robotsTxt || ""} onChange={(value) => setSettings({ ...settings, robotsTxt: value })} />
        </label>
        <button type="submit"><Save size={18} /> Save</button>
        {message ? <p>{message}</p> : null}
      </form>
    </AdminShell>
  );
}
