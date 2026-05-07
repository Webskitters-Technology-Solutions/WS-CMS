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

export default function UsersAdmin() {
  return <AdminShell title="Users"><ResourceManager endpoint="/api/users" fields={[{ name: "firstName", label: "First Name" }, { name: "lastName", label: "Last Name" }, { name: "email", label: "Email" }, { name: "password", label: "Password" }, { name: "role", label: "Role ObjectId" }, { name: "status", label: "Status", type: "select", options: ["active", "inactive", "suspended"] }]} /></AdminShell>;
}
