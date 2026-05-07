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
import bcrypt from "bcryptjs";
import { RoleModel, UserModel } from "../../database/models.js";
import { createCrudRouter } from "../../utils/crud-router.js";
import { userCreateSchema } from "../../validators/cms.js";

export const usersRouter = createCrudRouter({
  model: UserModel,
  resource: "user",
  permissions: {
    create: "users:create",
    read: "users:read",
    update: "users:update",
    delete: "users:delete"
  },
  schema: userCreateSchema,
  searchFields: ["firstName", "lastName", "email"],
  beforeCreate: async (body, req) => {
    const role = await RoleModel.findById(body.role);
    if (role?.slug === "super-admin" && req.user?.roleSlug !== "super-admin") {
      throw Object.assign(new Error("Only Super Admin can assign the Super Admin role"), { status: 403 });
    }
    return {
      ...body,
      passwordHash: await bcrypt.hash(body.password, 12),
      password: undefined,
      createdBy: req.user?.id,
      updatedBy: req.user?.id
    };
  },
  beforeUpdate: async (document, body, req) => {
    if (body.role) {
      const role = await RoleModel.findById(body.role);
      if (role?.slug === "super-admin" && req.user?.roleSlug !== "super-admin") {
        throw Object.assign(new Error("Only Super Admin can assign the Super Admin role"), { status: 403 });
      }
    }
    const currentRole = await RoleModel.findById(document.role);
    if (currentRole?.slug === "super-admin") {
      const superAdminRole = await RoleModel.findOne({ slug: "super-admin" });
      const activeSuperAdminCount = await UserModel.countDocuments({ role: superAdminRole?._id, status: "active" });
      const nextRoleId = body.role || document.role?.toString();
      const nextStatus = body.status || document.status;
      const demotesLastSuperAdmin = nextRoleId !== document.role?.toString() && activeSuperAdminCount <= 1;
      const disablesLastSuperAdmin = document.status === "active" && nextStatus !== "active" && activeSuperAdminCount <= 1;
      if (demotesLastSuperAdmin || disablesLastSuperAdmin) {
        throw Object.assign(new Error("Cannot demote or deactivate the last active Super Admin."), { status: 400 });
      }
    }
    return {
      ...body,
      passwordHash: body.password ? await bcrypt.hash(body.password, 12) : undefined,
      password: undefined,
      refreshTokenHashes: body.status && body.status !== "active" ? [] : undefined,
      updatedBy: req.user?.id
    };
  },
  preventDelete: async (document) => {
    const role = await RoleModel.findById(document.role);
    if (role?.slug === "super-admin") {
      const superAdminRole = await RoleModel.findOne({ slug: "super-admin" });
      const count = await UserModel.countDocuments({ role: superAdminRole?._id, status: "active" });
      if (count <= 1) {
        return "Cannot delete the last active Super Admin.";
      }
    }
    return null;
  }
});
