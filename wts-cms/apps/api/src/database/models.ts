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
import mongoose, { Schema } from "mongoose";

const seoSchema = new Schema(
  {
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" },
    robotsIndex: { type: Boolean, default: true },
    robotsFollow: { type: Boolean, default: true },
    ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" },
    ogImage: { type: String, default: "" },
    ogUrl: { type: String, default: "" },
    ogType: {
      type: String,
      enum: ["website", "article", "blog", "profile", "product"],
      default: "website"
    },
    schemaJson: { type: String, default: "" }
  },
  { _id: false }
);

const auditMetaSchema = new Schema({}, { strict: false, _id: false });

export const PermissionModel = mongoose.model(
  "Permission",
  new Schema(
    {
      key: { type: String, required: true, unique: true, index: true },
      resource: { type: String, required: true, index: true },
      action: { type: String, required: true },
      description: { type: String, default: "" },
      isSystem: { type: Boolean, default: true }
    },
    { timestamps: true }
  )
);

export const RoleModel = mongoose.model(
  "Role",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      description: { type: String, default: "" },
      permissions: [{ type: String, required: true }],
      isSystem: { type: Boolean, default: false }
    },
    { timestamps: true }
  )
);

export const UserModel = mongoose.model(
  "User",
  new Schema(
    {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
      passwordHash: { type: String, required: true },
      avatar: { type: String, default: "" },
      role: { type: Schema.Types.ObjectId, ref: "Role", required: true, index: true },
      status: { type: String, enum: ["active", "inactive", "suspended"], default: "active", index: true },
      emailVerified: { type: Boolean, default: false },
      lastLoginAt: { type: Date },
      refreshTokenHashes: [{ type: String }],
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);

export const RedirectModel = mongoose.model(
  "Redirect",
  new Schema(
    {
      source: { type: String, required: true, unique: true, index: true },
      destination: { type: String, required: true },
      statusCode: { type: Number, enum: [301, 302], default: 301 },
      createdReason: { type: String, enum: ["manual", "slug_change"], default: "manual" },
      entityType: { type: String, default: "" },
      entityId: { type: Schema.Types.ObjectId },
      isActive: { type: Boolean, default: true, index: true }
    },
    { timestamps: true }
  )
);

const contentBaseFields = {
  title: { type: String, required: true },
  slug: { type: String, required: true, index: true },
  permalink: { type: String, required: true, unique: true, index: true },
  h1: { type: String, required: true },
  excerpt: { type: String, default: "" },
  content: { type: String, default: "" },
  blocks: { type: [Schema.Types.Mixed], default: [] },
  status: {
    type: String,
    enum: ["draft", "pending_review", "approved", "published", "scheduled", "archived"],
    default: "draft",
    index: true
  },
  featuredImage: { type: String, default: "" },
  featuredImageAlt: { type: String, default: "" },
  publishedAt: { type: Date, index: true },
  seo: { type: seoSchema, default: () => ({}) },
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
};

export const PageModel = mongoose.model(
  "Page",
  new Schema(
    {
      ...contentBaseFields,
      template: { type: String, default: "default" },
      parentPage: { type: Schema.Types.ObjectId, ref: "Page", index: true },
      order: { type: Number, default: 0 },
      bannerImage: { type: String, default: "" },
      bannerImageAlt: { type: String, default: "" },
      author: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);

export const CategoryModel = mongoose.model(
  "Category",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      description: { type: String, default: "" },
      seo: { type: seoSchema, default: () => ({}) },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    { timestamps: true }
  )
);

export const TagModel = mongoose.model(
  "Tag",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      description: { type: String, default: "" },
      seo: { type: seoSchema, default: () => ({}) },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    { timestamps: true }
  )
);

export const BlogModel = mongoose.model(
  "Blog",
  new Schema(
    {
      ...contentBaseFields,
      authorName: { type: String, required: true },
      authorUser: { type: Schema.Types.ObjectId, ref: "User" },
      readingTime: { type: Number, default: 1 },
      categories: [{ type: Schema.Types.ObjectId, ref: "Category", index: true }],
      tags: [{ type: Schema.Types.ObjectId, ref: "Tag", index: true }],
      tableOfContents: [{ level: Number, text: String, anchor: String }]
    },
    { timestamps: true }
  )
);

const menuItemSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, enum: ["page", "blog", "category", "tag", "location", "custom"], required: true },
    referenceId: { type: Schema.Types.ObjectId },
    url: { type: String, default: "" },
    target: { type: String, enum: ["self", "blank"], default: "self" },
    rel: { type: String, enum: ["follow", "nofollow"], default: "follow" },
    parent: { type: String, default: "" },
    order: { type: Number, default: 0 },
    children: { type: [Schema.Types.Mixed], default: [] }
  },
  { _id: false }
);

export const MenuModel = mongoose.model(
  "Menu",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      location: { type: String, enum: ["header", "footer", "sidebar", "custom"], index: true },
      items: { type: [menuItemSchema], default: [] },
      status: { type: String, enum: ["active", "inactive"], default: "active" }
    },
    { timestamps: true }
  )
);

export const MediaModel = mongoose.model(
  "Media",
  new Schema(
    {
      filename: { type: String, required: true },
      originalName: { type: String, required: true },
      mimeType: { type: String, required: true, index: true },
      size: { type: Number, required: true },
      width: { type: Number },
      height: { type: Number },
      folder: { type: String, default: "Library", index: true },
      variants: { type: [Schema.Types.Mixed], default: [] },
      url: { type: String, required: true },
      altText: { type: String, default: "" },
      caption: { type: String, default: "" },
      uploadedBy: { type: Schema.Types.ObjectId, ref: "User", index: true }
    },
    { timestamps: true }
  )
);

const formFieldSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "email", "phone", "textarea", "select", "checkbox", "radio", "date", "file"],
      default: "text"
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    options: { type: [String], default: [] }
  },
  { _id: false }
);

export const FormModel = mongoose.model(
  "Form",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      description: { type: String, default: "" },
      fields: { type: [formFieldSchema], default: [] },
      status: { type: String, enum: ["active", "inactive"], default: "active", index: true },
      notificationEmail: { type: String, default: "" },
      successMessage: { type: String, default: "Thank you. Your submission has been received by Webskitters." },
      honeypotField: { type: String, default: "companyWebsite" },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);

export const FormSubmissionModel = mongoose.model(
  "FormSubmission",
  new Schema(
    {
      form: { type: Schema.Types.ObjectId, ref: "Form", required: true, index: true },
      values: { type: Schema.Types.Mixed, default: {} },
      status: { type: String, enum: ["new", "read", "archived"], default: "new", index: true },
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" }
    },
    { timestamps: true }
  )
);

export const NotificationModel = mongoose.model(
  "Notification",
  new Schema(
    {
      title: { type: String, required: true },
      message: { type: String, default: "" },
      type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
      status: { type: String, enum: ["unread", "read"], default: "unread", index: true },
      actor: { type: Schema.Types.ObjectId, ref: "User" },
      resource: { type: String, default: "" },
      resourceId: { type: Schema.Types.ObjectId },
      metadata: { type: Schema.Types.Mixed, default: {} }
    },
    { timestamps: true }
  )
);

const locationInfoSchema = new Schema(
  {
    name: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    phone: String,
    email: String,
    latitude: Number,
    longitude: Number,
    openingHours: String,
    mapUrl: String
  },
  { _id: false }
);

export const SettingsModel = mongoose.model(
  "Settings",
  new Schema(
    {
      siteName: { type: String, default: "WTS CMS" },
      siteUrl: { type: String, default: "http://localhost:3000" },
      defaultMetaTitle: { type: String, default: "WTS CMS | Powered by Webskitters" },
      defaultMetaDescription: {
        type: String,
        default:
          "WTS CMS is a lightweight, SEO-ready CMS platform powered by Webskitters Technology Solutions Pvt. Ltd."
      },
      defaultOgImage: { type: String, default: "" },
      gtmContainerId: { type: String, default: "" },
      robotsTxt: { type: String, default: "User-agent: *\nAllow: /\n" },
      organisationSchema: { type: String, default: "" },
      seoAdminPreferences: { type: Schema.Types.Mixed, default: {} },
      businessLocations: { type: [locationInfoSchema], default: [] },
      socialLinks: { type: Schema.Types.Mixed, default: {} },
      footerText: { type: String, default: "Powered by Webskitters Technology Solutions Pvt. Ltd." },
      poweredByText: { type: String, default: "Powered by Webskitters Technology Solutions Pvt. Ltd." }
    },
    { timestamps: true }
  )
);

export const LocationModel = mongoose.model(
  "Location",
  new Schema(
    {
      name: { type: String, required: true },
      slug: { type: String, required: true, unique: true, index: true },
      permalink: { type: String, required: true, unique: true },
      h1: { type: String, required: true },
      excerpt: { type: String, default: "" },
      content: { type: String, default: "" },
      address: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      latitude: { type: Number },
      longitude: { type: Number },
      status: { type: String, enum: ["draft", "pending_review", "approved", "published", "archived"], default: "draft" },
      seo: { type: seoSchema, default: () => ({}) }
    },
    { timestamps: true }
  )
);

export const ContentRevisionModel = mongoose.model(
  "ContentRevision",
  new Schema(
    {
      entityType: { type: String, enum: ["page", "blog", "location"], required: true, index: true },
      entityId: { type: Schema.Types.ObjectId, required: true, index: true },
      title: { type: String, default: "" },
      status: { type: String, default: "" },
      snapshot: { type: Schema.Types.Mixed, required: true },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
      reason: { type: String, default: "update" }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);

export const PreviewTokenModel = mongoose.model(
  "PreviewToken",
  new Schema(
    {
      token: { type: String, required: true, unique: true, index: true },
      entityType: { type: String, enum: ["page", "blog", "location"], required: true, index: true },
      entityId: { type: Schema.Types.ObjectId, required: true, index: true },
      expiresAt: { type: Date, required: true, index: { expires: 0 } },
      createdBy: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
  )
);

export const AuditLogModel = mongoose.model(
  "AuditLog",
  new Schema(
    {
      actor: { type: Schema.Types.ObjectId, ref: "User" },
      action: { type: String, required: true, index: true },
      resource: { type: String, required: true, index: true },
      resourceId: { type: Schema.Types.ObjectId },
      ipAddress: { type: String, default: "" },
      userAgent: { type: String, default: "" },
      metadata: { type: auditMetaSchema, default: {} }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
  )
);
