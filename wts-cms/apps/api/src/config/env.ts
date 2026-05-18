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
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WTS_CMS_BRAND_NAME: z.string().default("WTS CMS"),
  WTS_CMS_POWERED_BY: z.string().default("Webskitters Technology Solutions Pvt. Ltd."),
  API_PORT: z.coerce.number().int().positive().default(4000),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  MONGO_URI: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001"),
  PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_SITE_URL: z.string().url().default("http://localhost:3001"),
  API_BASE_URL: z.string().url().default("http://localhost:4000"),
  UPLOAD_DIR: z.string().default("uploads"),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(5),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_BUCKET: z.string().optional().default(""),
  S3_REGION: z.string().optional().default(""),
  S3_ENDPOINT: z.string().optional().default(""),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(""),
  AV_SCAN_ENABLED: z
    .string()
    .optional()
    .default("false")
    .transform((value) => value === "true"),
  DEFAULT_SUPER_ADMIN_EMAIL: z.string().email().default("admin@webskitters.com"),
  DEFAULT_SUPER_ADMIN_PASSWORD: z.string().default("ChangeMe@12345"),
  DEFAULT_SUPER_ADMIN_FIRST_NAME: z.string().default("Webskitters"),
  DEFAULT_SUPER_ADMIN_LAST_NAME: z.string().default("Admin"),
  GTM_CONTAINER_ID: z.string().optional().default("")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`WTS CMS API environment validation failed: ${parsed.error.message}`);
}

export const env = {
  ...parsed.data,
  CORS_ORIGINS: parsed.data.CORS_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean)
};
