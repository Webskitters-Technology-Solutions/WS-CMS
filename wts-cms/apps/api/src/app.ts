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
import mongoSanitize from "express-mongo-sanitize";
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
import { locationsRouter } from "./modules/locations/locations.routes.js";
import { mediaRouter } from "./modules/media/media.routes.js";
import { menusRouter } from "./modules/menus/menus.routes.js";
import { pagesRouter } from "./modules/pages/pages.routes.js";
import { permissionsRouter } from "./modules/permissions/permissions.routes.js";
import { publicRouter } from "./modules/public.routes.js";
import { redirectsRouter } from "./modules/redirects/redirects.routes.js";
import { rolesRouter } from "./modules/roles/roles.routes.js";
import { seoRouter } from "./modules/seo/seo.routes.js";
import { settingsRouter } from "./modules/settings/settings.routes.js";
import { tagsRouter } from "./modules/tags/tags.routes.js";
import { usersRouter } from "./modules/users/users.routes.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { requestId } from "./middleware/request-id.js";
import { ok, fail } from "./utils/api-response.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
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
      contentSecurityPolicy: false,
      hsts: env.NODE_ENV === "production",
      frameguard: { action: "deny" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" }
    })
  );
  app.use((_req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || env.CORS_ORIGINS.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error("CORS origin denied"));
      },
      credentials: true
    })
  );
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: env.NODE_ENV === "development" ? 5000 : 500,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, res) => fail(res, 429, "Too many requests, please try again later.", "RATE_LIMITED")
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(mongoSanitize());
  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR)));

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

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "development" ? 500 : 20,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => fail(res, 429, "Too many login attempts, please wait and try again.", "AUTH_RATE_LIMITED")
  });
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/roles", rolesRouter);
  app.use("/api/permissions", permissionsRouter);
  app.use("/api/pages", pagesRouter);
  app.use("/api/blogs", blogsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api/menus", menusRouter);
  app.use("/api/media", mediaRouter);
  app.use("/api/redirects", redirectsRouter);
  app.use("/api/locations", locationsRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/audit-logs", auditLogsRouter);
  app.use("/api/public", publicRouter);
  app.use("/api/seo", seoRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
