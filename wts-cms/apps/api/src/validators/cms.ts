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
import { passwordSchema, seoSchema } from "@wts-cms/shared";
import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) });

const statusSchema = z.enum(["draft", "pending_review", "approved", "published", "scheduled", "archived"]);

export const contentSchema = z.object({
  title: z.string().min(1),
  slug: z.string().optional(),
  permalink: z.string().optional(),
  h1: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  blocks: z.array(z.record(z.unknown())).optional(),
  status: statusSchema.optional(),
  featuredImage: z.string().optional(),
  featuredImageAlt: z.string().optional(),
  bannerImage: z.string().optional(),
  bannerImageAlt: z.string().optional(),
  template: z.string().optional(),
  parentPage: z.string().regex(/^[a-f\d]{24}$/i).optional().or(z.literal("")),
  order: z.number().optional(),
  authorName: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  seo: seoSchema.optional()
});

export const userCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: passwordSchema,
  role: z.string().regex(/^[a-f\d]{24}$/i),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  emailVerified: z.boolean().optional()
});

export const userUpdateSchema = userCreateSchema.partial().omit({ password: true }).extend({
  password: passwordSchema.optional()
});

export const roleSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
  isSystem: z.boolean().optional()
});

export const taxonomySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  seo: seoSchema.optional()
});

export const redirectSchema = z.object({
  source: z.string().startsWith("/"),
  destination: z.string().startsWith("/"),
  statusCode: z.coerce.number().pipe(z.union([z.literal(301), z.literal(302)])).default(301),
  createdReason: z.enum(["manual", "slug_change"]).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  isActive: z.boolean().optional()
});

export const menuSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  location: z.enum(["header", "footer", "sidebar", "custom"]),
  status: z.enum(["active", "inactive"]).optional(),
  items: z.array(z.record(z.unknown())).default([])
});

export const mediaUpdateSchema = z.object({
  altText: z.string().optional(),
  caption: z.string().optional(),
  folder: z.string().optional()
});

export const formSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(z.record(z.unknown())).default([]),
  status: z.enum(["active", "inactive"]).optional(),
  notificationEmail: z.string().email().optional().or(z.literal("")),
  successMessage: z.string().optional(),
  honeypotField: z.string().optional()
});

export const formSubmissionSchema = z.object({
  values: z.record(z.unknown()).default({})
});

export const settingsSchema = z.record(z.unknown());

export const locationSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  permalink: z.string().optional(),
  h1: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  status: z.enum(["draft", "pending_review", "approved", "published", "archived"]).optional(),
  seo: seoSchema.optional()
});
