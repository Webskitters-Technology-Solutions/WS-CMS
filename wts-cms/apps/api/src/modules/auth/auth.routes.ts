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
import bcrypt from "bcryptjs";
import { Router } from "express";
import { RoleModel, UserModel } from "../../database/models.js";
import { authenticate, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import { fail, ok } from "../../utils/api-response.js";
import { safeMongoUpdate, safeObjectId } from "../../utils/safe-query.js";
import { audit } from "../audit-logs/audit.service.js";
import { changePasswordSchema, loginSchema, refreshSchema } from "./auth.validators.js";

export const authRouter = Router();

function serializeUser(user: any, role: any) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: role
      ? {
          id: role._id.toString(),
          name: role.name,
          slug: role.slug
        }
      : null,
    permissions: role?.permissions ?? []
  };
}

async function issueTokens(user: any, role: any) {
  const permissions = role?.permissions ?? [];
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    roleSlug: role?.slug ?? "",
    permissions
  });
  const refreshToken = signRefreshToken({ sub: user._id.toString() });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
  return { accessToken, refreshToken, refreshTokenHash, permissions };
}

authRouter.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const credentials = loginSchema.parse(req.body);
    const user = await UserModel.findOne({ email: credentials.email }).select("+passwordHash");
    if (!user || user.status !== "active") {
      return fail(res, 401, "Invalid credentials", "INVALID_CREDENTIALS");
    }
    const valid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!valid) {
      return fail(res, 401, "Invalid credentials", "INVALID_CREDENTIALS");
    }
    const role = await RoleModel.findById(safeObjectId(user.role?.toString()));
    const tokens = await issueTokens(user, role);
    const lastLoginAt = new Date();
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: safeMongoUpdate({ lastLoginAt }),
        $push: { refreshTokenHashes: { $each: [tokens.refreshTokenHash], $slice: -10 } }
      }
    );
    user.lastLoginAt = lastLoginAt;
    req.user = { id: user._id.toString(), roleSlug: role?.slug ?? "", permissions: tokens.permissions };
    await audit(req, "login", "auth", user._id.toString());
    return ok(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: serializeUser(user, role)
    });
  })
);

authRouter.post(
  "/refresh",
  validate(refreshSchema),
  asyncHandler(async (req, res) => {
    const payload = verifyRefreshToken(req.body.refreshToken);
    const user = await UserModel.findById(safeObjectId(payload.sub));
    if (!user || user.status !== "active") {
      return fail(res, 401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
    const matches = await Promise.all(
      (user.refreshTokenHashes || []).map((hash) => bcrypt.compare(req.body.refreshToken, hash))
    );
    const matchedIndex = matches.findIndex(Boolean);
    if (matchedIndex === -1) {
      return fail(res, 401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
    const role = await RoleModel.findById(safeObjectId(user.role?.toString()));
    const tokens = await issueTokens(user, role);
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          [`refreshTokenHashes.${matchedIndex}`]: tokens.refreshTokenHash
        }
      }
    );
    return ok(res, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: serializeUser(user, role)
    });
  })
);

authRouter.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) => {
    await UserModel.findByIdAndUpdate(req.user?.id, { $set: { refreshTokenHashes: [] } });
    await audit(req, "logout", "auth", req.user?.id);
    return ok(res, {});
  })
);

authRouter.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user?.id);
    const role = user ? await RoleModel.findById(user.role) : null;
    if (!user) {
      return fail(res, 404, "User not found", "USER_NOT_FOUND");
    }
    return ok(res, serializeUser(user, role));
  })
);

authRouter.post(
  "/change-password",
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.user?.id).select("+passwordHash");
    if (!user) {
      return fail(res, 404, "User not found", "USER_NOT_FOUND");
    }
    const valid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!valid) {
      return fail(res, 400, "Current password is incorrect", "INVALID_CURRENT_PASSWORD");
    }
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    user.refreshTokenHashes = [];
    await user.save();
    return ok(res, {});
  })
);
