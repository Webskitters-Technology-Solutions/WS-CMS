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
import { RedirectModel } from "../../database/models.js";
import { createCrudRouter } from "../../utils/crud-router.js";
import { redirectSchema } from "../../validators/cms.js";

export const redirectsRouter = createCrudRouter({
  model: RedirectModel,
  resource: "redirect",
  permissions: {
    create: "redirects:create",
    read: "redirects:read",
    update: "redirects:update",
    delete: "redirects:delete"
  },
  schema: redirectSchema,
  searchFields: ["source", "destination"],
  beforeCreate: async (body) => {
    if (body.source === body.destination) {
      throw Object.assign(new Error("Redirect source and destination cannot be the same"), { status: 400 });
    }
    const loop = await RedirectModel.findOne({ source: body.destination, destination: body.source, isActive: true });
    if (loop) {
      throw Object.assign(new Error("Redirect loop detected"), { status: 400 });
    }
    return body;
  },
  beforeUpdate: async (_document, body) => {
    if (body.source && body.destination && body.source === body.destination) {
      throw Object.assign(new Error("Redirect source and destination cannot be the same"), { status: 400 });
    }
    if (body.source && body.destination) {
      const loop = await RedirectModel.findOne({ source: body.destination, destination: body.source, isActive: true });
      if (loop) {
        throw Object.assign(new Error("Redirect loop detected"), { status: 400 });
      }
    }
    return body;
  }
});
