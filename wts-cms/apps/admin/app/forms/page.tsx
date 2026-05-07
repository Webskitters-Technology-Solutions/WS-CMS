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
import { AdminShell } from "../../components/AdminShell";
import { ResourceManager } from "../../components/ResourceManager";

export default function FormsAdmin() {
  return (
    <AdminShell title="Forms">
      <ResourceManager
        endpoint="/api/forms"
        fields={[
          { name: "name", label: "Name" },
          { name: "slug", label: "Slug" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "status", label: "Status", type: "select", options: ["active", "inactive"] },
          { name: "notificationEmail", label: "Notification Email" },
          { name: "successMessage", label: "Success Message", type: "textarea" },
          { name: "honeypotField", label: "Spam Honeypot Field" },
          { name: "fields", label: "Fields JSON", type: "json" }
        ]}
      />
    </AdminShell>
  );
}
