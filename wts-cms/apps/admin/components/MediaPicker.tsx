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
"use client";

import { useEffect, useState } from "react";
import { Image, Search, X } from "lucide-react";
import { adminApi } from "../lib/api";

interface MediaItem {
  _id: string;
  originalName: string;
  url: string;
  altText?: string;
  folder?: string;
  width?: number;
  height?: number;
}

export function MediaPicker({
  label = "Media URL",
  value,
  onChange,
  onAltChange
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onAltChange?: (altText: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const params = new URLSearchParams({ limit: "24" });
    if (search) {
      params.set("search", search);
    }
    const data = await adminApi(`/api/media?${params.toString()}`);
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (open) {
      void load().catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load media"));
    }
  }, [open]);

  return (
    <div className="media-picker">
      <label className="cms-field">
        <span>{label}</span>
        <div className="cms-inline-input">
          <Image size={16} />
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="/uploads/wts-cms-image.webp" />
          <button className="cms-ghost-button compact" type="button" onClick={() => setOpen(true)}>
            Browse
          </button>
        </div>
      </label>
      {value ? (
        <div className="media-picker-preview">
          <img src={value} alt="" />
          <span>{value}</span>
        </div>
      ) : null}
      {open ? (
        <div className="media-picker-overlay" role="dialog" aria-modal="true" aria-label="Select media">
          <div className="media-picker-modal">
            <div className="media-picker-header">
              <div>
                <span className="cms-kicker">WTS CMS media library</span>
                <h2>Select image</h2>
              </div>
              <button className="cms-icon-button" type="button" aria-label="Close media picker" onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="media-picker-search">
              <div className="cms-inline-input">
                <Search size={16} />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by filename, alt text, or folder" />
              </div>
              <button className="cms-ghost-button" type="button" onClick={() => void load()}>
                Search
              </button>
            </div>
            {message ? <p className="meta">{message}</p> : null}
            <div className="media-picker-grid">
              {items.map((item) => (
                <button
                  className="media-picker-item"
                  key={item._id}
                  type="button"
                  onClick={() => {
                    onChange(item.url);
                    onAltChange?.(item.altText || "");
                    setOpen(false);
                  }}
                >
                  <img src={item.url} alt={item.altText || ""} />
                  <strong>{item.originalName}</strong>
                  <span>{item.altText || "Alt text missing"}</span>
                  <small>
                    {item.folder || "Library"} {item.width && item.height ? `· ${item.width}x${item.height}` : ""}
                  </small>
                </button>
              ))}
            </div>
            {!items.length ? <p className="meta">No media found. Upload images from the WTS CMS media section.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
