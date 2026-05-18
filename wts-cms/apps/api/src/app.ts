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
import path from "node:path";
import compression from "compression";
import cors from "cors";
import express from "express";
import slowDown from "express-slow-down";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { BRAND } from "@wts-cms/shared";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { isDatabaseReady } from "./database/connection.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { auditLogsRouter } from "./modules/audit-logs/audit-logs.routes.js";
import { blogsRouter } from "./modules/blogs/blogs.routes.js";
import { categoriesRouter } from "./modules/categories/categories.routes.js";
import { formsRouter } from "./modules/forms/forms.routes.js";
import { importExportRouter } from "./modules/import-export/import-export.routes.js";
import { locationsRouter } from "./modules/locations/locations.routes.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { menusRouter } from "./modules/menus/menus.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { pagesRouter } from "./modules/pages/pages.routes.js";
import { permissionsRouter } from "./modules/permissions/permissions.routes.js";
import { publicRouter } from "./modules/public.routes.js";
import { redirectsRouter } from "./modules/redirects/redirects.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { searchRouter } from "./modules/search/search.routes.js";
import { seoRouter } from "./modules/seo/seo.routes.js";
import { sessionsRouter } from "./modules/sessions/sessions.routes.js";
import { settingsRouter } from "./modules/settings/settings.routes.js";
import { tagsRouter } from "./modules/tags/tags.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { mongoSanitizeRequest, mutationOriginGuard, noStoreApiResponses, publicContentCache } from "./middleware/security.js";
import { ok, fail } from "./utils/api-response.js";

export function createApp() {
  const app = express();
  const useHttpsHeaders =
    env.API_BASE_URL.startsWith("https://") && env.PUBLIC_SITE_URL.startsWith("https://") && env.ADMIN_SITE_URL.startsWith("https://");

  app.disable("x-powered-by");
  if (env.TRUST_PROXY > 0) {
    app.set("trust proxy", env.TRUST_PROXY);
  }
  app.use(requestId);
  app.use((req, res, next) => {
    const startedAt = Date.now();
    res.on("finish", () => {
      logger.info(
        {
          requestId: req.requestId,
          method: req.method,
          path: req.originalUrl,
          statusCode: res.statusCode,
          durationMs: Date.now() - startedAt
        },
        "WTS CMS API request completed"
      );
    });
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          connectSrc: ["'self'", ...env.CORS_ORIGINS],
          fontSrc: ["'self'", "data:"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", "data:", "blob:", "https:"],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          upgradeInsecureRequests: useHttpsHeaders ? [] : null
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: useHttpsHeaders ? { policy: "same-origin" } : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      hsts: useHttpsHeaders ? { maxAge: 15552000, includeSubDomains: true, preload: true } : false,
      frameguard: { action: "deny" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  );
  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  });
  app.use(
    cors({
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Authorization", "Content-Type", "X-Request-ID"],
      exposedHeaders: ["X-Request-ID", "RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
      maxAge: 600,
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      credentials: true
    })
  );
  app.use(noStoreApiResponses);
  app.use(mutationOriginGuard);
  app.use(compression({ threshold: 1024 }));
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.NODE_ENV === "development" ? 5000 : 500,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => fail(res, 429, "Too many requests, please try again later.", "RATE_LIMITED")
    })
  );
  app.use(
    slowDown({
      windowMs: 15 * 60 * 1000,
      delayAfter: env.NODE_ENV === "development" ? 1000 : 150,
      delayMs: () => (env.NODE_ENV === "development" ? 0 : 125)
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(hpp());
  app.use(mongoSanitizeRequest);
  app.use(
    "/uploads",
    express.static(path.resolve(env.UPLOAD_DIR), {
      immutable: true,
      maxAge: "30d",
      setHeaders(res) {
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      }
    })
  );

  app.get("/health", (_req, res) =>
    ok(res, {
      service: "WTS CMS API",
      poweredBy: BRAND.company,
      status: "healthy",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0"
    })
  );

  app.get("/ready", (_req, res) =>
    isDatabaseReady() ? ok(res, { status: "ready", mongo: "connected" }) : fail(res, 503, "MongoDB is not ready", "NOT_READY")
  );

  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "development" ? 500 : 25,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: (_req, res) => fail(res, 429, "Too many login attempts, please wait and try again.", "AUTH_RATE_LIMITED")
  });
  const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "development" ? 1000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => fail(res, 429, "Too many token refresh attempts, please wait and try again.", "AUTH_REFRESH_RATE_LIMITED")
  });
  app.use("/api/auth/login", loginLimiter);
  app.use("/api/auth/refresh", refreshLimiter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/roles", rolesRouter);
  app.use("/api/permissions", permissionsRouter);
  app.use("/api/pages", pagesRouter);
  app.use("/api/blogs", blogsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api/menus", menusRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/forms", formsRouter);
  app.use("/api/import-export", importExportRouter);
  app.use("/api/redirects", redirectsRouter);
  app.use("/api/locations", locationsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/audit-logs", auditLogsRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/sessions", sessionsRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/public", publicContentCache, publicRouter);
  app.use("/api/seo", publicContentCache, seoRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
