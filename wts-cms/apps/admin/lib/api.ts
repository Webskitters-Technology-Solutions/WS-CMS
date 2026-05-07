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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

class AdminAuthError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AdminAuthError";
  }
}

let refreshPromise: Promise<string> | null = null;

export function getAccessToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem("wtsAccessToken") || "";
}

function getRefreshToken() {
  if (typeof window === "undefined") {
    return "";
  }
  return window.localStorage.getItem("wtsRefreshToken") || "";
}

function storeTokens(accessToken: string, refreshToken: string) {
  window.localStorage.setItem("wtsAccessToken", accessToken);
  window.localStorage.setItem("wtsRefreshToken", refreshToken);
}

export function clearAdminSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem("wtsAccessToken");
  window.localStorage.removeItem("wtsRefreshToken");
}

export function hasAdminSession() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function isAdminAuthError(error: unknown) {
  return error instanceof AdminAuthError;
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new AdminAuthError();
  }

  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refreshToken })
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.success === false || !body.data?.accessToken || !body.data?.refreshToken) {
          clearAdminSession();
          throw new AdminAuthError(body.message || "Session expired");
        }
        storeTokens(body.data.accessToken, body.data.refreshToken);
        return body.data.accessToken as string;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function requestAdminApi(path: string, init: RequestInit, token: string) {
  const hasBody = typeof init.body !== "undefined";
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  const headers = new Headers(init.headers);

  if (hasBody && !isFormData && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers
  });
}

export async function adminApi(path: string, init: RequestInit = {}, retried = false): Promise<any> {
  const token = getAccessToken();
  const response = await requestAdminApi(path, init, token);
  const body = await response.json().catch(() => ({}));

  if (response.status === 401 && !retried && !path.startsWith("/api/auth/refresh")) {
    await refreshAccessToken();
    return adminApi(path, init, true);
  }

  if (!response.ok || body.success === false) {
    if (response.status === 401) {
      clearAdminSession();
      throw new AdminAuthError(body.message || "Session expired");
    }
    throw new Error(body.message || "WTS CMS admin request failed");
  }
  return body.data;
}
