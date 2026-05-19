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
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Box,
  Code2,
  Columns3,
  Copy,
  Eye,
  FileText,
  Image,
  Layers,
  Maximize2,
  Minimize2,
  Monitor,
  MousePointer2,
  Paintbrush,
  PanelLeft,
  Plus,
  Search,
  Settings2,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  X
} from "lucide-react";
import { resolveApiAssetUrl } from "../lib/api";
import { AdminTextEditor } from "./AdminTextEditor";
import { MediaPicker } from "./MediaPicker";

type InsertKind = "h2" | "h3" | "p" | "blockquote" | "ul" | "image" | "code";
type DeviceMode = "desktop" | "tablet" | "mobile";
type InspectorTab = "content" | "style" | "advanced";
type BuilderMode = "visual" | "html";

export interface BuilderBlockItem {
  title?: string;
  body?: string;
  image?: string;
  imageAlt?: string;
}

export interface BuilderBlock {
  id: string;
  type: string;
  title?: string;
  body?: string;
  mediaUrl?: string;
  formSlug?: string;
  items?: BuilderBlockItem[];
  collapsed?: boolean;
  settings?: {
    align?: "left" | "center" | "right";
    spacing?: string;
    background?: string;
    anchor?: string;
    customClass?: string;
  };
}

interface VisualHtmlEditorTabsProps<TBlock extends BuilderBlock> {
  entityLabel: "page" | "blog" | "article";
  title: string;
  h1: string;
  permalink: string;
  content: string;
  onContentChange: (value: string) => void;
  blocks: TBlock[];
  onInsertContentBlock: (kind: InsertKind) => void;
  blockTemplates: Array<{ label: string; value: TBlock["type"] }>;
  onAddVisualBlock: (type: TBlock["type"]) => void;
  onUpdateVisualBlock: (id: string, patch: Partial<TBlock>) => void;
  onMoveVisualBlock: (id: string, direction: -1 | 1) => void;
  onDuplicateVisualBlock: (block: TBlock) => void;
  onRemoveVisualBlock: (id: string) => void;
  seoScore: number;
  seoTotal: number;
  readabilityScore: number;
  readabilityTotal: number;
  wordCount: number;
  auxiliaryLabel?: string;
  auxiliaryValue?: string;
  onAuxiliaryChange?: (value: string) => void;
}

export function VisualHtmlEditorTabs<TBlock extends BuilderBlock>({
  entityLabel,
  title,
  h1,
  permalink,
  content,
  onContentChange,
  blocks,
  onInsertContentBlock,
  blockTemplates,
  onAddVisualBlock,
  onUpdateVisualBlock,
  onMoveVisualBlock,
  onDuplicateVisualBlock,
  onRemoveVisualBlock,
  seoScore,
  seoTotal,
  readabilityScore,
  readabilityTotal,
  wordCount,
  auxiliaryLabel,
  auxiliaryValue,
  onAuxiliaryChange
}: VisualHtmlEditorTabsProps<TBlock>) {
  const [mode, setMode] = useState<BuilderMode>("visual");
  const [isStudioOpen, setIsStudioOpen] = useState(true);
  const [device, setDevice] = useState<DeviceMode>("desktop");
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [selectedBlockId, setSelectedBlockId] = useState<string>(blocks[0]?.id || "");
  const layersPanelRef = useRef<HTMLDivElement | null>(null);
  const selectedBlock = useMemo(() => blocks.find((block) => block.id === selectedBlockId), [blocks, selectedBlockId]);
  const shellClassName = `builder-editor-shell ${mode === "visual" && isStudioOpen ? "is-fullscreen" : ""}`;
  const isFullscreenVisualMode = mode === "visual" && isStudioOpen;

  useEffect(() => {
    if (selectedBlockId && !blocks.some((block) => block.id === selectedBlockId)) {
      setSelectedBlockId(blocks[0]?.id || "");
    }
  }, [blocks, selectedBlockId]);

  useEffect(() => {
    if (!isFullscreenVisualMode) {
      return undefined;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousOverscrollBehavior = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.classList.add("wts-builder-studio-active");

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscrollBehavior;
      document.body.classList.remove("wts-builder-studio-active");
    };
  }, [isFullscreenVisualMode]);

  function updateSelectedBlock(patch: Partial<TBlock>) {
    if (!selectedBlock) {
      return;
    }
    onUpdateVisualBlock(selectedBlock.id, patch);
  }

  function updateSelectedSettings(settings: NonNullable<BuilderBlock["settings"]>) {
    if (!selectedBlock) {
      return;
    }
    onUpdateVisualBlock(selectedBlock.id, {
      settings: {
        ...(selectedBlock.settings || {}),
        ...settings
      }
    } as Partial<TBlock>);
  }

  function updateSelectedItem(index: number, patch: BuilderBlockItem) {
    if (!selectedBlock) {
      return;
    }

    const items = [...(selectedBlock.items || [])];
    items[index] = {
      ...(items[index] || {}),
      ...patch
    };
    updateSelectedBlock({ items } as Partial<TBlock>);
  }

  function addSelectedItem() {
    if (!selectedBlock) {
      return;
    }

    const nextItemNumber = (selectedBlock.items?.length || 0) + 1;
    updateSelectedBlock({
      items: [
        ...(selectedBlock.items || []),
        {
          title: `${labelForBlock(selectedBlock.type)} item ${nextItemNumber}`,
          body: "Add a short, useful description for this item.",
          image: "",
          imageAlt: ""
        }
      ]
    } as Partial<TBlock>);
  }

  function removeSelectedItem(index: number) {
    if (!selectedBlock) {
      return;
    }

    updateSelectedBlock({ items: (selectedBlock.items || []).filter((_, itemIndex) => itemIndex !== index) } as Partial<TBlock>);
  }

  function moveSelectedItem(index: number, direction: -1 | 1) {
    if (!selectedBlock?.items?.length) {
      return;
    }

    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= selectedBlock.items.length) {
      return;
    }

    const items = [...selectedBlock.items];
    const [item] = items.splice(index, 1);
    if (!item) {
      return;
    }
    items.splice(targetIndex, 0, item);
    updateSelectedBlock({ items } as Partial<TBlock>);
  }

  function focusLayersPanel() {
    layersPanelRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <div className={shellClassName}>
      <div className="builder-studio-topbar">
        <div className="builder-studio-title">
          <strong>{entityLabel === "article" ? "Article visual studio" : `${labelForBlock(entityLabel)} visual studio`}</strong>
          <span>{h1 || title || `Untitled ${entityLabel}`} · {permalink || "/"}</span>
        </div>
        <div className="builder-mode-tabs" role="tablist" aria-label={`${entityLabel} editing mode`}>
          <button
            className={mode === "visual" ? "active" : ""}
            type="button"
            role="tab"
            onClick={() => {
              setMode("visual");
              setIsStudioOpen(true);
            }}
          >
            <MousePointer2 size={16} /> Visual editor
          </button>
          <button
            className={mode === "html" ? "active" : ""}
            type="button"
            role="tab"
            onClick={() => {
              setMode("html");
              setIsStudioOpen(false);
            }}
          >
            <Code2 size={16} /> HTML editor
          </button>
        </div>
        <div className="builder-studio-actions">
          <span>{wordCount} words</span>
          <button
            type="button"
            onClick={() => setIsStudioOpen((value) => !value)}
            aria-label={isStudioOpen ? "Exit full screen editor" : "Open full screen editor"}
          >
            {isStudioOpen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            {isStudioOpen ? "Exit studio" : "Full screen"}
          </button>
        </div>
      </div>

      {mode === "html" ? (
        <div className="builder-html-panel">
          <div className="cms-card-header">
            <div>
              <span className="cms-kicker">Canonical HTML</span>
              <h2>Edit source markup</h2>
            </div>
            <span className="cms-status-pill">{wordCount} words</span>
          </div>
          <AdminTextEditor
            mode="code"
            minHeight={520}
            value={content}
            onChange={onContentChange}
            placeholder="<h2>Section heading</h2>&#10;<p>Write semantic HTML here...</p>"
          />
          <div className="cms-editor-metrics">
            <span>Visual blocks remain editable in the Visual editor tab</span>
            <span>Use H2-H5 inside body content</span>
            <span>Keep the H1 in the dedicated field</span>
          </div>
        </div>
      ) : (
        <div className="builder-workbench">
          <aside className="builder-inspector" aria-label="Visual editor inspector">
            <div className="builder-inspector-title">
              <div>
                <span className="cms-kicker">Inspector</span>
                <h2>{selectedBlock ? `Edit ${labelForBlock(selectedBlock.type)}` : `Edit ${entityLabel}`}</h2>
              </div>
              <PanelLeft size={18} />
            </div>
            <div className="builder-inspector-tabs" role="tablist" aria-label="Inspector panels">
              <button className={inspectorTab === "content" ? "active" : ""} type="button" onClick={() => setInspectorTab("content")}>
                <FileText size={15} /> Content
              </button>
              <button className={inspectorTab === "style" ? "active" : ""} type="button" onClick={() => setInspectorTab("style")}>
                <Paintbrush size={15} /> Style
              </button>
              <button className={inspectorTab === "advanced" ? "active" : ""} type="button" onClick={() => setInspectorTab("advanced")}>
                <Settings2 size={15} /> Advanced
              </button>
            </div>
            {inspectorTab === "content" ? (
              <div className="builder-inspector-panel">
                {selectedBlock ? (
                  <>
                    <label className="cms-field">
                      <span>Block title</span>
                      <input value={selectedBlock.title || ""} onChange={(event) => updateSelectedBlock({ title: event.target.value } as Partial<TBlock>)} />
                    </label>
                    <label className="cms-field">
                      <span>Block body</span>
                      <textarea value={selectedBlock.body || ""} onChange={(event) => updateSelectedBlock({ body: event.target.value } as Partial<TBlock>)} />
                    </label>
                    {selectedBlock.type !== "form" ? (
                      <MediaPicker
                        label="Image"
                        value={selectedBlock.mediaUrl || ""}
                        onChange={(url) => updateSelectedBlock({ mediaUrl: url } as Partial<TBlock>)}
                      />
                    ) : (
                      <label className="cms-field">
                        <span>Form slug</span>
                        <input
                          value={selectedBlock.formSlug || ""}
                          onChange={(event) => updateSelectedBlock({ formSlug: event.target.value } as Partial<TBlock>)}
                        />
                      </label>
                    )}
                    {isRepeatableBlock(selectedBlock.type) ? (
                      <div className="builder-item-editor">
                        <div className="builder-item-editor-header">
                          <div>
                            <span className="cms-kicker">Nested items</span>
                            <strong>{labelForBlock(selectedBlock.type)} content</strong>
                          </div>
                          <button type="button" onClick={addSelectedItem}>
                            <Plus size={15} /> Add item
                          </button>
                        </div>
                        {(selectedBlock.items?.length ? selectedBlock.items : []).map((item, index) => (
                          <article className="builder-item-card" key={`${selectedBlock.id}-item-editor-${index}`}>
                            <div className="builder-item-card-header">
                              <span>{index + 1}</span>
                              <strong>{item.title || `Item ${index + 1}`}</strong>
                              <div>
                                <button type="button" aria-label="Move item up" onClick={() => moveSelectedItem(index, -1)}>
                                  <ArrowUp size={13} />
                                </button>
                                <button type="button" aria-label="Move item down" onClick={() => moveSelectedItem(index, 1)}>
                                  <ArrowDown size={13} />
                                </button>
                                <button type="button" aria-label="Remove item" onClick={() => removeSelectedItem(index)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                            <label className="cms-field">
                              <span>Item title</span>
                              <input value={item.title || ""} onChange={(event) => updateSelectedItem(index, { title: event.target.value })} />
                            </label>
                            <label className="cms-field">
                              <span>Item body</span>
                              <textarea value={item.body || ""} onChange={(event) => updateSelectedItem(index, { body: event.target.value })} />
                            </label>
                            <MediaPicker
                              label="Item image"
                              value={item.image || ""}
                              onChange={(url) => updateSelectedItem(index, { image: url })}
                            />
                            <label className="cms-field">
                              <span>Image alt text</span>
                              <input value={item.imageAlt || ""} onChange={(event) => updateSelectedItem(index, { imageAlt: event.target.value })} />
                            </label>
                          </article>
                        ))}
                        {!selectedBlock.items?.length ? (
                          <div className="builder-item-empty">
                            <Box size={20} />
                            <span>Add the first item to edit card, FAQ, or gallery content.</span>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <div className="builder-add-grid">
                      <button type="button" onClick={() => onInsertContentBlock("p")}>
                        <AlignLeft size={16} /> Paragraph
                      </button>
                      <button type="button" onClick={() => onInsertContentBlock("h2")}>
                        <Type size={16} /> Heading
                      </button>
                      <button type="button" onClick={() => onInsertContentBlock("image")}>
                        <Image size={16} /> Image
                      </button>
                      <button type="button" onClick={() => onInsertContentBlock("ul")}>
                        <Columns3 size={16} /> List
                      </button>
                    </div>
                    {auxiliaryLabel && onAuxiliaryChange ? (
                      <label className="cms-field">
                        <span>{auxiliaryLabel}</span>
                        <input value={auxiliaryValue || ""} onChange={(event) => onAuxiliaryChange(event.target.value)} />
                      </label>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
            {inspectorTab === "style" ? (
              <div className="builder-inspector-panel">
                <label className="cms-field">
                  <span>Alignment</span>
                  <select
                    value={selectedBlock?.settings?.align || "left"}
                    onChange={(event) => updateSelectedSettings({ align: event.target.value as "left" | "center" | "right" })}
                    disabled={!selectedBlock}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </label>
                <label className="cms-field">
                  <span>Section spacing</span>
                  <select
                    value={selectedBlock?.settings?.spacing || "comfortable"}
                    onChange={(event) => updateSelectedSettings({ spacing: event.target.value })}
                    disabled={!selectedBlock}
                  >
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </label>
                <label className="cms-field">
                  <span>Background tone</span>
                  <select
                    value={selectedBlock?.settings?.background || "white"}
                    onChange={(event) => updateSelectedSettings({ background: event.target.value })}
                    disabled={!selectedBlock}
                  >
                    <option value="white">White</option>
                    <option value="soft">Soft neutral</option>
                    <option value="brand">Brand tint</option>
                    <option value="dark">Dark contrast</option>
                  </select>
                </label>
                {!selectedBlock ? <p className="meta">Select a canvas block to edit style controls.</p> : null}
              </div>
            ) : null}
            {inspectorTab === "advanced" ? (
              <div className="builder-inspector-panel">
                <label className="cms-field">
                  <span>Anchor ID</span>
                  <input
                    value={selectedBlock?.settings?.anchor || ""}
                    onChange={(event) => updateSelectedSettings({ anchor: event.target.value })}
                    disabled={!selectedBlock}
                    placeholder="section-anchor"
                  />
                </label>
                <label className="cms-field">
                  <span>CSS class</span>
                  <input
                    value={selectedBlock?.settings?.customClass || ""}
                    onChange={(event) => updateSelectedSettings({ customClass: event.target.value })}
                    disabled={!selectedBlock}
                    placeholder="optional-class-name"
                  />
                </label>
                <p className="meta">Advanced values are stored with the visual block and can be used by custom public templates.</p>
              </div>
            ) : null}
          </aside>

          <section className="builder-stage">
            <div className="builder-toolbar">
              <div className="builder-toolbar-group">
                <button type="button" onClick={focusLayersPanel}>
                  <Layers size={16} /> Layers
                </button>
                <button type="button" onClick={() => onInsertContentBlock("h2")}>
                  <Plus size={16} /> Add heading
                </button>
                <button type="button" onClick={() => onInsertContentBlock(entityLabel === "blog" || entityLabel === "article" ? "code" : "blockquote")}>
                  <Box size={16} /> Insert block
                </button>
              </div>
              <div className="builder-device-toggle" aria-label="Preview device">
                <button
                  className={device === "desktop" ? "active" : ""}
                  type="button"
                  onClick={() => setDevice("desktop")}
                  aria-label="Desktop preview"
                  aria-pressed={device === "desktop"}
                  title="Desktop preview"
                >
                  <Monitor size={16} />
                </button>
                <button
                  className={device === "tablet" ? "active" : ""}
                  type="button"
                  onClick={() => setDevice("tablet")}
                  aria-label="Tablet preview"
                  aria-pressed={device === "tablet"}
                  title="Tablet preview"
                >
                  <Tablet size={16} />
                </button>
                <button
                  className={device === "mobile" ? "active" : ""}
                  type="button"
                  onClick={() => setDevice("mobile")}
                  aria-label="Mobile preview"
                  aria-pressed={device === "mobile"}
                  title="Mobile preview"
                >
                  <Smartphone size={16} />
                </button>
              </div>
              <div className="builder-score-group">
                <span>{seoTotal ? Math.round((seoScore / seoTotal) * 100) : 0}/100 SEO</span>
                <span>{readabilityTotal ? Math.round((readabilityScore / readabilityTotal) * 100) : 0}/100 Read</span>
                <button type="button" aria-label="Preview canvas">
                  <Eye size={16} />
                </button>
                <button type="button" aria-label="Search canvas">
                  <Search size={16} />
                </button>
              </div>
            </div>
            <div className={`builder-canvas-wrap device-${device}`}>
              <span className="builder-device-label">{device} preview</span>
              <article className="builder-canvas">
                <header className="builder-canvas-nav">
                  <strong>WS CMS</strong>
                  <nav aria-label="Preview navigation">
                    <span>Home</span>
                    <span>Pages</span>
                    <span>Blog</span>
                    <span>Contact</span>
                  </nav>
                </header>
                {!blocks.length ? (
                  <section className="builder-canvas-hero" onClick={() => setSelectedBlockId("")}>
                    <span className="cms-kicker">{entityLabel}</span>
                    <h1>{h1 || title || `Untitled ${entityLabel}`}</h1>
                    <p>{permalink}</p>
                  </section>
                ) : null}
                {blocks.map((block) => (
                  <section
                    className={`builder-block-preview builder-block-${block.type} ${selectedBlockId === block.id ? "selected" : ""} tone-${
                      block.settings?.background || "white"
                    } align-${block.settings?.align || "left"} space-${block.settings?.spacing || "comfortable"}`}
                    id={block.settings?.anchor || undefined}
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    <div className="builder-block-controls">
                      <button type="button" aria-label="Move block up" onClick={(event) => {
                        event.stopPropagation();
                        onMoveVisualBlock(block.id, -1);
                      }}>
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" aria-label="Move block down" onClick={(event) => {
                        event.stopPropagation();
                        onMoveVisualBlock(block.id, 1);
                      }}>
                        <ArrowDown size={14} />
                      </button>
                      <button type="button" aria-label="Duplicate block" onClick={(event) => {
                        event.stopPropagation();
                        onDuplicateVisualBlock(block);
                      }}>
                        <Copy size={14} />
                      </button>
                      <button type="button" aria-label="Delete block" onClick={(event) => {
                        event.stopPropagation();
                        onRemoveVisualBlock(block.id);
                      }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <BlockPreview block={block} />
                  </section>
                ))}
                {content ? (
                  <section className="builder-canvas-content is-selectable" onClick={() => setSelectedBlockId("")}>
                    <span className="builder-section-label">Editorial HTML</span>
                    <div className="builder-rich-output" dangerouslySetInnerHTML={{ __html: content }} />
                  </section>
                ) : null}
                {!blocks.length && !content ? (
                  <section className="builder-canvas-content is-selectable" onClick={() => setSelectedBlockId("")}>
                    <div className="builder-empty-state">
                      <FileText size={28} />
                      <strong>Start with content or a visual block</strong>
                      <p>Add structured text, images, lists, CTAs, FAQs, or gallery sections.</p>
                    </div>
                  </section>
                ) : null}
                <footer className="builder-canvas-footer">
                  Powered by Webskitters Technology Solutions Pvt. Ltd.
                </footer>
              </article>
            </div>
          </section>

          <aside className="builder-outline" aria-label="Visual blocks and layers">
            <div className="builder-outline-card" ref={layersPanelRef}>
              <div className="builder-outline-header">
                <span className="cms-kicker">Add blocks</span>
                <Plus size={17} />
              </div>
              <div className="builder-template-list">
                {blockTemplates.map((template) => (
                  <button key={String(template.value)} type="button" onClick={() => onAddVisualBlock(template.value)}>
                    <Plus size={15} /> {template.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="builder-outline-card">
              <div className="builder-outline-header">
                <span className="cms-kicker">Layers</span>
                <Layers size={17} />
              </div>
              <div className="builder-layer-list">
                {blocks.length ? (
                  blocks.map((block, index) => (
                    <button
                      className={selectedBlockId === block.id ? "active" : ""}
                      key={block.id}
                      type="button"
                      onClick={() => setSelectedBlockId(block.id)}
                    >
                      <span>{index + 1}</span>
                      <strong>{block.title || labelForBlock(block.type)}</strong>
                      <small>{labelForBlock(block.type)}</small>
                    </button>
                  ))
                ) : (
                  <div className="builder-outline-empty">
                    <Box size={22} />
                    <span>No visual blocks yet</span>
                  </div>
                )}
              </div>
            </div>
            <button className="builder-outline-close" type="button" onClick={() => setIsStudioOpen(false)}>
              <X size={16} /> Return to page settings
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

function BlockPreview({ block }: { block: BuilderBlock }) {
  const imageUrl = block.mediaUrl ? resolveApiAssetUrl(block.mediaUrl) : "";
  if (block.type === "hero" || block.type === "cta") {
    return (
      <div className="builder-hero-block" style={imageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(15, 23, 42, 0.72), rgba(15, 23, 42, 0.2)), url(${imageUrl})` } : undefined}>
        <span className="cms-kicker">{labelForBlock(block.type)}</span>
        <h2>{block.title || "Hero section"}</h2>
        <p>{block.body || "Add a strong message for this section."}</p>
        <button type="button">Primary action</button>
      </div>
    );
  }

  if (block.type === "cards" || block.type === "gallery" || block.type === "faq") {
    return (
      <div className="builder-card-block">
        <div>
          <span className="cms-kicker">{labelForBlock(block.type)}</span>
          <h2>{block.title || "Content group"}</h2>
          <p>{block.body || "Use nested items for repeatable content."}</p>
        </div>
        <div className="builder-card-grid">
          {(block.items?.length ? block.items : [{ title: "Item title", body: "Item description" }]).map((item, index) => (
            <article key={`${block.id}-${index}`}>
              {item.image ? <img src={resolveApiAssetUrl(item.image)} alt={item.imageAlt || ""} /> : <Box size={28} />}
              <strong>{item.title || "Item title"}</strong>
              <p>{item.body || "Item description"}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === "form") {
    return (
      <div className="builder-form-block">
        <div>
          <span className="cms-kicker">Form block</span>
          <h2>{block.title || "Contact form"}</h2>
          <p>{block.body || "Connect this visual block to a WTS CMS form slug."}</p>
        </div>
        <div className="builder-form-placeholder">
          <FileText size={24} />
          <span>{block.formSlug || "form-slug"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="builder-card-block">
      {imageUrl ? <img src={imageUrl} alt="" /> : null}
      <h2>{block.title || labelForBlock(block.type)}</h2>
      <p>{block.body || "Edit this visual block from the inspector."}</p>
    </div>
  );
}

function labelForBlock(type: string) {
  return type
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function isRepeatableBlock(type: string) {
  return type === "cards" || type === "gallery" || type === "faq";
}
