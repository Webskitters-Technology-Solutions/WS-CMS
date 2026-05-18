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
import { CategoryModel } from "../../database/models.js";
import { createCrudRouter, slugFromName } from "../../utils/crud-router.js";
import { taxonomySchema } from "../../validators/cms.js";

export const categoriesRouter = createCrudRouter({
  model: CategoryModel,
  resource: "category",
  permissions: {
    create: "categories:create",
    read: "categories:read",
    update: "categories:update",
    delete: "categories:delete"
  },
  schema: taxonomySchema,
  searchFields: ["name", "description"],
  beforeCreate: (body) => slugFromName(body),
  beforeUpdate: (_document, body) => (body.name || body.slug ? slugFromName(body) : body)
});
