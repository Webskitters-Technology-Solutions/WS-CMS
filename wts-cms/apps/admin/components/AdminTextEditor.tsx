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

interface QuillInstance {
  root: HTMLElement;
  clipboard: {
    dangerouslyPasteHTML: (html: string) => void;
  };
  on: (eventName: "text-change", handler: () => void) => void;
}

type QuillConstructor = new (
  element: HTMLElement,
  options: {
    modules: { toolbar: unknown[] };
    placeholder?: string;
    theme: string;
  }
) => QuillInstance;

const toolbarOptions = [
  [{ header: [2, 3, 4, 5, false] }],
  ["bold", "italic", "underline", "blockquote", "code-block"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["link", "image"],
  ["clean"]
];

export function AdminTextEditor({
  id,
  label,
  mode = "rich",
  minHeight = 180,
  placeholder,
  value,
  onChange
}: AdminTextEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<QuillInstance | null>(null);
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [richView, setRichView] = useState<"visual" | "html">("visual");
  const [editorError, setEditorError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    lastValueRef.current = value;
    if (mode === "rich" && richView === "visual" && quillRef.current && quillRef.current.root.innerHTML !== value) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value || "");
    }
  }, [mode, richView, value]);

  useEffect(() => {
    if (mode !== "rich" || !hostRef.current || quillRef.current) {
      return;
    }

    let mounted = true;
    const host = hostRef.current;
    host.innerHTML = "";

    void import("quill")
      .then((module) => {
        if (!mounted || !hostRef.current) {
          return;
        }
        const Quill = (module.default || (module as unknown as { Quill?: QuillConstructor }).Quill) as QuillConstructor | undefined;
        if (!Quill) {
          throw new Error("Quill editor failed to load");
        }
        hostRef.current.innerHTML = "";
        const quill = new Quill(hostRef.current, {
          modules: { toolbar: toolbarOptions },
          placeholder,
          theme: "snow"
        });
        quill.clipboard.dangerouslyPasteHTML(lastValueRef.current || "");
        quill.on("text-change", () => {
          const nextValue = quill.root.innerHTML;
          lastValueRef.current = nextValue;
          onChangeRef.current(nextValue);
        });
        quillRef.current = quill;
        setEditorError("");
      })
      .catch((error: unknown) => {
        if (!mounted) {
          return;
        }
        setEditorError(error instanceof Error ? error.message : "Rich text editor failed to load");
        setRichView("html");
      });

    return () => {
      mounted = false;
      quillRef.current = null;
      host.innerHTML = "";
    };
  }, [mode, placeholder]);

  function switchRichView(nextView: "visual" | "html") {
    if (nextView === "visual" && quillRef.current) {
      quillRef.current.clipboard.dangerouslyPasteHTML(lastValueRef.current || "");
    }
    setRichView(nextView);
  }

  if (mode !== "rich") {
    return (
      <div className={`admin-editor admin-editor-${mode}`}>
        {label ? <span className="admin-editor-label">{label}</span> : null}
        <textarea
          id={id}
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
        {label ? <span className="admin-editor-label">{label}</span> : <span />}
        <div className="admin-editor-view-toggle" aria-label="Editor view">
          <button
            className={richView === "visual" ? "active" : ""}
            type="button"
            onClick={() => switchRichView("visual")}
          >
            Visual
          </button>
          <button
            className={richView === "html" ? "active" : ""}
            type="button"
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
      {editorError ? <span className="admin-editor-error">{editorError}. HTML view is still available.</span> : null}
      <div className="admin-quill-shell" style={{ display: richView === "visual" ? "block" : "none", minHeight }}>
        <div ref={hostRef} />
      </div>
    </div>
  );
}
