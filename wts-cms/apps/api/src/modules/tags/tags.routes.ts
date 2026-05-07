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
import { TagModel } from "../../database/models.js";
import { createCrudRouter, slugFromName } from "../../utils/crud-router.js";
import { taxonomySchema } from "../../validators/cms.js";

export const tagsRouter = createCrudRouter({
  model: TagModel,
  resource: "tag",
  permissions: {
    create: "tags:create",
    read: "tags:read",
    update: "tags:update",
    delete: "tags:delete"
  },
  schema: taxonomySchema,
  searchFields: ["name", "description"],
  beforeCreate: (body) => slugFromName(body),
  beforeUpdate: (_document, body) => (body.name || body.slug ? slugFromName(body) : body)
});
