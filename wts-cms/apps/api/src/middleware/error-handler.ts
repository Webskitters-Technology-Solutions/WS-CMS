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
import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { fail } from "../utils/api-response.js";

export const notFound: RequestHandler = (_req, res) => {
  fail(res, 404, "Route not found", "NOT_FOUND");
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  logger.error({ error, requestId: req.requestId }, "WTS CMS API request failed");
  if (error instanceof mongoose.Error.ValidationError) {
    return fail(res, 422, "Validation failed", "VALIDATION_ERROR", error.errors);
  }
  if (error?.code === 11000) {
    return fail(res, 409, "A record with the same unique value already exists", "DUPLICATE_KEY");
  }
  return fail(res, error.status || 500, error.message || "Internal server error", "INTERNAL_ERROR", {
    requestId: req.requestId,
    stack: env.NODE_ENV === "production" ? undefined : error.stack
  });
};
