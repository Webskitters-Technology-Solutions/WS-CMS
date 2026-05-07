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
import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";
import { fail } from "../utils/api-response.js";

const mutatingMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function allowedOrigins() {
  return new Set([env.PUBLIC_SITE_URL, env.ADMIN_SITE_URL, env.API_BASE_URL, ...env.CORS_ORIGINS]);
}

function requestOrigin(req: Request) {
  const origin = req.header("origin");
  if (origin) {
    return origin;
  }
  const referer = req.header("referer");
  if (!referer) {
    return "";
  }
  try {
    return new URL(referer).origin;
  } catch {
    return "";
  }
}

export function noStoreApiResponses(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store");
  next();
}

export function publicContentCache(_req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "public, max-age=30, s-maxage=60, stale-while-revalidate=300");
  next();
}

export function mutationOriginGuard(req: Request, res: Response, next: NextFunction) {
  if (!mutatingMethods.has(req.method) || req.path.startsWith("/api/public/forms/")) {
    return next();
  }

  const origin = requestOrigin(req);
  if (!origin || allowedOrigins().has(origin)) {
    return next();
  }

  return fail(res, 403, "Request origin is not allowed for this WTS CMS action", "ORIGIN_DENIED", {
    origin
  });
}
