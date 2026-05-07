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

export default function LocationsAdmin() {
  return <AdminShell title="Locations"><ResourceManager endpoint="/api/locations" fields={[{ name: "name", label: "Name" }, { name: "h1", label: "H1" }, { name: "slug", label: "Slug" }, { name: "address", label: "Address", type: "textarea" }, { name: "content", label: "LocalBusiness content", type: "textarea" }, { name: "status", label: "Status", type: "select", options: ["draft", "pending_review", "approved", "published", "archived"] }, { name: "seo", label: "SEO / LocalBusiness JSON", type: "json" }]} /></AdminShell>;
}
