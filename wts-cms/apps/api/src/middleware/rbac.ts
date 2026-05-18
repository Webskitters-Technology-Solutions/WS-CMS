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
import type { PermissionKey } from "@wts-cms/shared";
import { fail } from "../utils/api-response.js";

export function hasPermission(userPermissions: readonly string[], required: PermissionKey): boolean {
  return userPermissions.includes(required);
}

export function requirePermission(required: PermissionKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || (req.user.roleSlug !== "super-admin" && !hasPermission(req.user.permissions, required))) {
      return fail(res, 403, "You do not have permission to perform this action", "FORBIDDEN", {
        required
      });
    }
    return next();
  };
}
