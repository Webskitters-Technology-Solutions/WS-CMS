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

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { adminApi, resolveApiAssetUrl } from "../lib/api";

type EditorMode = "rich" | "plain" | "code";

interface AdminTextEditorProps {
  id?: string;
  label?: string;
  mode?: EditorMode;
  minHeight?: number;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

type EditorCommand =
  | "bold"
  | "italic"
  | "underline"
  | "formatBlock"
  | "insertOrderedList"
  | "insertUnorderedList"
  | "createLink"
  | "insertImage"
  | "removeFormat";

const richToolbar: Array<{ label: string; command: EditorCommand; value?: string; prompt?: string }> = [
  { label: "P", command: "formatBlock", value: "p" },
  { label: "H2", command: "formatBlock", value: "h2" },
  { label: "H3", command: "formatBlock", value: "h3" },
  { label: "H4", command: "formatBlock", value: "h4" },
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  { label: "OL", command: "insertOrderedList" },
  { label: "UL", command: "insertUnorderedList" },
  { label: "Quote", command: "formatBlock", value: "blockquote" },
  { label: "Code", command: "formatBlock", value: "pre" },
  { label: "Link", command: "createLink", prompt: "Enter a safe URL" },
  { label: "Image URL", command: "insertImage", prompt: "Enter an image URL" },
  { label: "Clear", command: "removeFormat" }
];
const safeEditorTagNames = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "h4",
  "h5",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "pre",
  "code"
]);
const blockEditorTagNames = new Set(["p", "h2", "h3", "h4", "h5", "blockquote", "pre"]);

export function AdminTextEditor({
  id,
  label,
  mode = "rich",
  minHeight = 180,
  placeholder,
  value,
  onChange
}: AdminTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const selfChangeValueRef = useRef<string | null>(null);
  const imageUploadInputRef = useRef<HTMLInputElement | null>(null);
  const [richView, setRichView] = useState<"visual" | "html">("visual");
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const labelId = label && id ? `${id}-label` : undefined;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    lastValueRef.current = value;
    if (selfChangeValueRef.current === value) {
      selfChangeValueRef.current = null;
      return;
    }
    if (mode === "rich" && richView === "visual" && editorRef.current && editorRef.current.innerHTML !== value) {
      renderEditorHtml(editorRef.current, value);
      syncEditorEmpty();
    }
  }, [mode, richView, value]);

  useEffect(() => {
    if (mode !== "rich" || !editorRef.current) {
      return;
    }
    renderEditorHtml(editorRef.current, lastValueRef.current);
    syncEditorEmpty();
  }, [mode]);

  function switchRichView(nextView: "visual" | "html") {
    if (nextView === "visual" && editorRef.current) {
      renderEditorHtml(editorRef.current, lastValueRef.current);
      syncEditorEmpty();
    }
    setRichView(nextView);
  }

  function emitVisualChange() {
    const nextValue = editorRef.current?.innerHTML || "";
    lastValueRef.current = nextValue;
    selfChangeValueRef.current = nextValue;
    syncEditorEmpty();
    onChangeRef.current(nextValue);
  }

  function runCommand(item: { command: EditorCommand; value?: string; prompt?: string }) {
    editorRef.current?.focus();
    let commandValue = item.value || "";

    if (item.prompt) {
      const response = window.prompt(item.prompt);
      if (!response) {
        return;
      }
      commandValue = response.trim();
      const isSafeUrl = item.command === "insertImage" ? isSafeEditorImageUrl(commandValue) : isSafeEditorLinkUrl(commandValue);
      if (!isSafeUrl) {
        return;
      }
      if (item.command === "insertImage") {
        commandValue = resolveApiAssetUrl(commandValue);
      }
    }

    applyEditorCommand(editorRef.current, item.command, commandValue);
    emitVisualChange();
  }

  async function uploadEditorImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      setUploadMessage("");
      const altText = window.prompt("Image alt text for accessibility and SEO")?.trim() || "";
      const data = new FormData();
      data.set("file", file);
      data.set("altText", altText);
      data.set("folder", "Editor uploads");
      const media = await adminApi("/api/media/upload", {
        method: "POST",
        body: data
      });
      const editor = editorRef.current;
      if (!editor) {
        return;
      }
      editor.focus();
      insertImage(editor, resolveApiAssetUrl(media.url), media.altText || altText);
      emitVisualChange();
      setUploadMessage("Image uploaded and inserted.");
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  }

  function syncEditorEmpty() {
    const text = editorRef.current?.textContent?.replace(/\u00a0/g, " ").trim() || "";
    const hasMedia = Boolean(editorRef.current?.querySelector("img, table"));
    setIsEditorEmpty(!text && !hasMedia);
  }

  if (mode !== "rich") {
    return (
      <div className={`admin-editor admin-editor-${mode}`}>
        {label ? <span className="admin-editor-label" id={labelId}>{label}</span> : null}
        <textarea
          id={id}
          aria-label={labelId ? undefined : label}
          aria-labelledby={labelId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          spellCheck={mode !== "code"}
        />
      </div>
    );
  }

  return (
    <div className="admin-editor admin-editor-rich">
      <div className="admin-editor-topline">
        {label ? <span className="admin-editor-label" id={labelId}>{label}</span> : <span />}
        <div className="admin-editor-view-toggle" aria-label="Editor view" role="tablist">
          <button
            className={richView === "visual" ? "active" : ""}
            type="button"
            aria-pressed={richView === "visual"}
            role="tab"
            onClick={() => switchRichView("visual")}
          >
            Visual
          </button>
          <button
            className={richView === "html" ? "active" : ""}
            type="button"
            aria-pressed={richView === "html"}
            role="tab"
            onClick={() => switchRichView("html")}
          >
            HTML
          </button>
        </div>
      </div>
      {richView === "html" ? (
        <textarea
          className="admin-html-editor"
          id={id}
          aria-label={labelId ? undefined : label}
          aria-labelledby={labelId}
          value={value}
          onChange={(event) => {
            lastValueRef.current = event.target.value;
            onChangeRef.current(event.target.value);
          }}
          placeholder={placeholder || "<h2>Heading</h2>\n<p>Paste HTML content here...</p>"}
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : null}
      <div className="admin-rich-shell" style={{ display: richView === "visual" ? "block" : "none" }}>
        <div className="admin-rich-toolbar" aria-label="Rich text formatting toolbar">
          {richToolbar.map((item) => (
            <button
              key={`${item.command}-${item.label}`}
              type="button"
              aria-label={`${item.label} formatting`}
              title={`${item.label} formatting`}
              onClick={() => runCommand(item)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            aria-label="Upload image"
            title="Upload image"
            disabled={uploadingImage}
            onClick={() => imageUploadInputRef.current?.click()}
          >
            {uploadingImage ? "Uploading..." : "Upload image"}
          </button>
          <input
            ref={imageUploadInputRef}
            className="admin-editor-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={uploadEditorImage}
          />
        </div>
        {uploadMessage ? <span className="admin-editor-message">{uploadMessage}</span> : null}
        <div
          id={id}
          ref={editorRef}
          className={`admin-rich-canvas${isEditorEmpty ? " is-empty" : ""}`}
          contentEditable
          data-placeholder={placeholder || "Start writing content..."}
          onBlur={emitVisualChange}
          onInput={emitVisualChange}
          onKeyUp={syncEditorEmpty}
          role="textbox"
          aria-multiline="true"
          aria-label={labelId ? undefined : label}
          aria-labelledby={labelId}
          suppressContentEditableWarning
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

function applyEditorCommand(editor: HTMLElement | null, command: EditorCommand, commandValue: string) {
  if (!editor) {
    return;
  }

  switch (command) {
    case "formatBlock":
      applyBlockFormat(editor, commandValue);
      break;
    case "bold":
      wrapSelectedContent(editor, "strong");
      break;
    case "italic":
      wrapSelectedContent(editor, "em");
      break;
    case "underline":
      wrapSelectedContent(editor, "u");
      break;
    case "insertOrderedList":
      insertList(editor, "ol");
      break;
    case "insertUnorderedList":
      insertList(editor, "ul");
      break;
    case "createLink":
      insertLink(editor, commandValue);
      break;
    case "insertImage":
      insertImage(editor, commandValue);
      break;
    case "removeFormat":
      removeSelectedFormatting(editor);
      break;
  }
}

function getEditorRange(editor: HTMLElement): Range | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer) ? range : null;
}

function replaceEditorSelection(editor: HTMLElement, nodes: Node[]) {
  const range = getEditorRange(editor);
  const fragment = document.createDocumentFragment();
  for (const node of nodes) {
    fragment.append(node);
  }

  if (!range) {
    editor.append(fragment);
    return;
  }

  const lastNode = fragment.lastChild;
  range.deleteContents();
  range.insertNode(fragment);
  if (lastNode) {
    moveCaretAfter(lastNode);
  }
}

function moveCaretAfter(node: Node) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
}

function wrapSelectedContent(editor: HTMLElement, tagName: "strong" | "em" | "u") {
  const range = getEditorRange(editor);
  if (!range || range.collapsed) {
    return;
  }

  const wrapper = document.createElement(tagName);
  wrapper.append(range.extractContents());
  range.insertNode(wrapper);
  moveCaretAfter(wrapper);
}

function applyBlockFormat(editor: HTMLElement, tagName: string) {
  const safeTagName = blockEditorTagNames.has(tagName) ? tagName : "p";
  const range = getEditorRange(editor);
  const block = range ? findNearestBlock(range.commonAncestorContainer, editor) : null;

  if (block) {
    const replacement = document.createElement(safeTagName);
    replacement.append(...Array.from(block.childNodes));
    block.replaceWith(replacement);
    moveCaretAfter(replacement);
    return;
  }

  const element = document.createElement(safeTagName);
  if (range && !range.collapsed) {
    element.append(range.extractContents());
  } else {
    element.append(document.createElement("br"));
  }
  replaceEditorSelection(editor, [element]);
}

function findNearestBlock(node: Node, editor: HTMLElement): HTMLElement | null {
  let current: Node | null = node.nodeType === Node.ELEMENT_NODE ? node : node.parentNode;
  while (current && current !== editor) {
    if (current instanceof HTMLElement && blockEditorTagNames.has(current.tagName.toLowerCase())) {
      return current;
    }
    current = current.parentNode;
  }
  return null;
}

function insertList(editor: HTMLElement, listTagName: "ol" | "ul") {
  const range = getEditorRange(editor);
  const selectedText = range?.toString().trim();
  const items = selectedText ? selectedText.split("\n").map((line) => line.trim()).filter(Boolean) : ["List item"];
  const list = document.createElement(listTagName);
  for (const item of items) {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    list.append(listItem);
  }
  replaceEditorSelection(editor, [list]);
}

function insertLink(editor: HTMLElement, href: string) {
  const range = getEditorRange(editor);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.rel = "noopener";
  anchor.textContent = range?.toString() || href;
  replaceEditorSelection(editor, [anchor]);
}

function insertImage(editor: HTMLElement, src: string, altText = "") {
  const image = document.createElement("img");
  image.src = src;
  image.alt = altText;
  image.loading = "lazy";
  replaceEditorSelection(editor, [image]);
}

function removeSelectedFormatting(editor: HTMLElement) {
  const range = getEditorRange(editor);
  if (!range || range.collapsed) {
    return;
  }
  replaceEditorSelection(editor, [document.createTextNode(range.toString())]);
}

function isSafeEditorLinkUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function isSafeEditorImageUrl(value: string) {
  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function renderEditorHtml(target: HTMLElement, html: string) {
  target.replaceChildren(...sanitizeEditorNodes(html));
}

function sanitizeEditorNodes(html: string): Node[] {
  const fragment = document.createDocumentFragment();
  const stack: HTMLElement[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const nextTagStart = html.indexOf("<", cursor);
    if (nextTagStart === -1) {
      appendEditorText(stack, fragment, html.slice(cursor));
      break;
    }

    appendEditorText(stack, fragment, html.slice(cursor, nextTagStart));
    const nextTagEnd = html.indexOf(">", nextTagStart + 1);
    if (nextTagEnd === -1) {
      appendEditorText(stack, fragment, html.slice(nextTagStart));
      break;
    }

    handleEditorTag(html.slice(nextTagStart + 1, nextTagEnd), stack, fragment);
    cursor = nextTagEnd + 1;
  }

  return Array.from(fragment.childNodes);
}

function appendEditorText(stack: HTMLElement[], fragment: DocumentFragment, text: string) {
  if (!text) {
    return;
  }
  const parent = stack.at(-1) || fragment;
  parent.append(document.createTextNode(decodeBasicEntities(text)));
}

function handleEditorTag(rawTag: string, stack: HTMLElement[], fragment: DocumentFragment) {
  const tag = rawTag.trim();
  if (!tag || tag.startsWith("!") || tag.startsWith("?")) {
    return;
  }

  if (tag.startsWith("/")) {
    const closingTag = safeTagName(readTagName(tag.slice(1)));
    while (closingTag && stack.length) {
      const current = stack.pop();
      if (current?.tagName.toLowerCase() === closingTag) {
        break;
      }
    }
    return;
  }

  const tagName = safeTagName(readTagName(tag));
  if (!tagName) {
    return;
  }

  const element = document.createElement(tagName);
  const attributes = safeAttributesFromTag(tag, tagName);
  if (tagName === "img" && !attributes.some((attribute) => attribute.name === "src")) {
    return;
  }
  for (const attribute of attributes) {
    element.setAttribute(attribute.name, attribute.value);
  }

  const parent = stack.at(-1) || fragment;
  parent.append(element);
  if (!tag.endsWith("/") && tagName !== "br" && tagName !== "img") {
    stack.push(element);
  }
}

function safeTagName(tagName: string) {
  return safeEditorTagNames.has(tagName) ? tagName : "";
}

function safeAttributesFromTag(tag: string, tagName: string) {
  const attributes: Array<{ name: string; value: string }> = [];
  const id = readAttribute(tag, "id");
  if (isSafeEditorId(id)) {
    attributes.push({ name: "id", value: id });
  }

  if (tagName === "a") {
    const href = readAttribute(tag, "href");
    if (href && isSafeEditorLinkUrl(href)) {
      attributes.push({ name: "href", value: href });
      attributes.push({ name: "rel", value: "noopener" });
    }
  }

  if (tagName === "img") {
    const src = readAttribute(tag, "src");
    if (src && isSafeEditorImageUrl(src)) {
      attributes.push({ name: "src", value: src });
      attributes.push({ name: "alt", value: (readAttribute(tag, "alt") || "").slice(0, 180) });
      attributes.push({ name: "loading", value: "lazy" });
    }
  }

  return attributes;
}

function readTagName(tag: string) {
  let name = "";
  for (const char of tag.trim().toLowerCase()) {
    const code = char.charCodeAt(0);
    const isLetter = code >= 97 && code <= 122;
    const isDigit = code >= 48 && code <= 57;
    if (isLetter || isDigit) {
      name += char;
      continue;
    }
    break;
  }
  return name;
}

function readAttribute(tag: string, attributeName: string) {
  const lowerTag = tag.toLowerCase();
  const needle = `${attributeName}=`;
  let index = lowerTag.indexOf(needle);
  while (index > -1) {
    const previous = index > 0 ? lowerTag[index - 1] : " ";
    if (previous === " " || previous === "\t" || previous === "\n") {
      break;
    }
    index = lowerTag.indexOf(needle, index + needle.length);
  }
  if (index === -1) {
    return "";
  }

  const valueStart = index + needle.length;
  const quote = tag[valueStart];
  if (quote !== "\"" && quote !== "'") {
    return "";
  }
  const valueEnd = tag.indexOf(quote, valueStart + 1);
  if (valueEnd === -1) {
    return "";
  }
  return decodeBasicEntities(tag.slice(valueStart + 1, valueEnd));
}

function isSafeEditorId(value: string) {
  if (!value || value.length > 80) {
    return false;
  }
  for (const char of value) {
    const code = char.charCodeAt(0);
    const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    const isDigit = code >= 48 && code <= 57;
    if (!isLetter && !isDigit && char !== "_" && char !== "-") {
      return false;
    }
  }
  return true;
}

function decodeBasicEntities(value: string) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}
