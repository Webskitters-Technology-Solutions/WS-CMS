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

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@webskitters.com");
  const [password, setPassword] = useState("ChangeMe@12345");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const contentType = response.headers.get("content-type") || "";
      const body = contentType.includes("application/json") ? await response.json() : { message: await response.text() };
      if (!response.ok || !body.success) {
        setError(body.message || "Login failed");
        return;
      }
      window.localStorage.setItem("wtsAccessToken", body.data.accessToken);
      window.localStorage.setItem("wtsRefreshToken", body.data.refreshToken);
      router.replace("/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
    }
  }

  return (
    <form className="login-panel" onSubmit={submit}>
      <h1>WTS CMS</h1>
      <p>Powered by Webskitters Technology Solutions Pvt. Ltd.</p>
      <label className="field">
        Email
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
      </label>
      <label className="field">
        Password
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
      </label>
      {error ? <p className="meta">{error}</p> : null}
      <button type="submit">
        <LockKeyhole size={18} /> Sign in
      </button>
    </form>
  );
}
