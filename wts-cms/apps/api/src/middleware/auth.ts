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
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { RoleModel, UserModel } from "../database/models.js";
import { fail } from "../utils/api-response.js";
import type { PermissionKey } from "@wts-cms/shared";

export interface AccessPayload {
  sub: string;
  roleSlug: string;
  permissions: PermissionKey[];
}

export function signAccessToken(payload: AccessPayload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN as any });
}

export function signRefreshToken(payload: Pick<AccessPayload, "sub">) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): Pick<AccessPayload, "sub"> {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as Pick<AccessPayload, "sub">;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return fail(res, 401, "Authentication required", "AUTH_REQUIRED");
  }
  try {
    const payload = verifyAccessToken(token);
    const user = await UserModel.findById(payload.sub);
    if (!user || user.status !== "active") {
      return fail(res, 401, "Invalid or expired token", "INVALID_TOKEN");
    }
    const role = await RoleModel.findById(user.role);
    if (!role) {
      return fail(res, 403, "User role is unavailable", "ROLE_UNAVAILABLE");
    }
    req.user = { id: user._id.toString(), roleSlug: role.slug, permissions: role.permissions as AccessPayload["permissions"] };
    return next();
  } catch {
    return fail(res, 401, "Invalid or expired token", "INVALID_TOKEN");
  }
}
