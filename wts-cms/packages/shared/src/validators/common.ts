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
import { z } from "zod";
import { isStrongPassword } from "../utils/password.js";
import { validateJsonLd } from "../utils/seo.js";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId.");

export const passwordSchema = z
  .string()
  .refine(isStrongPassword, "Password must be at least 10 chars and include upper, lower, number, and special character.");

export const seoSchema = z.object({
  metaTitle: z.string().max(70).optional().default(""),
  metaDescription: z.string().max(180).optional().default(""),
  canonicalUrl: z
    .string()
    .refine((value) => !value || value.startsWith("/") || z.string().url().safeParse(value).success, "canonicalUrl must be absolute or root-relative.")
    .optional()
    .default(""),
  robotsIndex: z.boolean().optional().default(true),
  robotsFollow: z.boolean().optional().default(true),
  ogTitle: z.string().optional().default(""),
  ogDescription: z.string().optional().default(""),
  ogImage: z.string().optional().default(""),
  ogUrl: z.string().optional().default(""),
  ogType: z.enum(["website", "article", "blog", "profile", "product"]).optional().default("website"),
  schemaJson: z.string().refine(validateJsonLd, "schemaJson must be valid JSON-LD.").optional().default("")
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional()
});
