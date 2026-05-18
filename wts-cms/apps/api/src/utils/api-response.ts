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
import type { Response } from "express";

export function ok<T>(res: Response, data: T, message = "Operation completed successfully", meta = {}) {
  return res.json({ success: true, message, data, meta });
}

export function created<T>(res: Response, data: T, message = "Resource created successfully") {
  return res.status(201).json({ success: true, message, data, meta: {} });
}

export function fail(res: Response, status: number, message: string, code = "REQUEST_FAILED", details = {}) {
  return res.status(status).json({ success: false, message, code, details });
}
