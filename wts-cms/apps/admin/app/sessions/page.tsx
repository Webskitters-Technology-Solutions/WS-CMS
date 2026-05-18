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
import { KeyRound, ShieldAlert } from "lucide-react";
import { AdminShell } from "../../components/AdminShell";
import { adminApi, clearAdminSession } from "../../lib/api";

export default function SessionsAdmin() {
  const [session, setSession] = useState<any>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    adminApi("/api/sessions").then(setSession).catch((error) => setMessage(error.message));
  }, []);

  async function revoke() {
    if (!window.confirm("Revoke all refresh sessions for this WTS CMS admin user?")) {
      return;
    }
    await adminApi("/api/sessions", { method: "DELETE" });
    clearAdminSession();
    window.location.href = "/login";
  }

  return (
    <AdminShell title="Sessions">
      <section className="panel">
        <h2><KeyRound size={18} /> Active Admin Sessions</h2>
        {message ? <p className="meta">{message}</p> : null}
        <p className="metric">{session?.activeRefreshSessions ?? 0}</p>
        <p className="meta">Refresh sessions for {session?.user?.email || "current Webskitters admin"}.</p>
        <button className="danger" onClick={() => void revoke()}><ShieldAlert size={18} /> Revoke sessions and log out</button>
      </section>
    </AdminShell>
  );
}
