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
