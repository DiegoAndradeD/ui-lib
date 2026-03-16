/**
 * MarkdownEditor
 * ─────────────────────────────────────────────────────────────────────────────
 * A fully self-contained, zero-dependency, fully-typed markdown editor.
 * Ships with:
 *   • Inline + block AST parser (bold, italic, strike, code, links, headings,
 *     blockquotes, code blocks, HR, ordered & unordered lists, paragraphs)
 *   • React renderer that walks the AST
 *   • Write / Split / Preview view modes
 *   • Wired toolbar (all actions manipulate the selection without losing focus)
 *   • ⌘B / ⌘I / ⌘S keyboard shortcuts + smart list-continuation on Enter
 *
 * Styling contract
 * ─────────────────────────────────────────────────────────────────────────────
 * The component is intentionally unstyled — it renders semantic HTML with
 * stable BEM-like class names so the parent can apply any design system:
 *
 *   .md-editor                   root wrapper
 *   .md-editor__toolbar          toolbar row
 *   .md-editor__tool-btn         toolbar button  (+ --active modifier)
 *   .md-editor__tool-sep         toolbar separator
 *   .md-editor__panes            flex container for write / preview panes
 *   .md-editor__write-pane       write-side wrapper
 *   .md-editor__textarea         the raw <textarea>
 *   .md-editor__preview-pane     preview-side wrapper
 *   .md-editor__preview          rendered prose container
 *   .md-editor__placeholder      shown when preview is empty
 *
 * Preview prose elements carry their own class names so the parent can target
 * them without bleeding into the rest of the app:
 *   .md-h1 … .md-h6  .md-p  .md-bq  .md-pre  .md-ul  .md-ol
 *   .md-hr  .md-code  .md-link
 */

import {
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
  type KeyboardEvent,
  type ChangeEvent,
  type CSSProperties,
  forwardRef,
  useImperativeHandle,
  type JSX,
} from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Public API types
// ─────────────────────────────────────────────────────────────────────────────

export type ViewMode = "write" | "split" | "preview";

export interface MarkdownEditorRef {
  /** Current markdown value */
  getValue(): string;
  /** Programmatically set the value */
  setValue(markdown: string): void;
  /** Focus the textarea */
  focus(): void;
}

export interface MarkdownEditorProps {
  /** Controlled value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;

  // ── Layout ──────────────────────────────────────────────────────────────
  viewMode?: ViewMode;
  textAlign?: "left" | "center" | "right";
  /** Placeholder shown in the textarea */
  placeholder?: string;
  /** Disable editing */
  readOnly?: boolean;

  // ── Callbacks ───────────────────────────────────────────────────────────
  /** Called when the user triggers ⌘S / Ctrl+S */
  onSave?: () => void;

  // ── Slots — lets the parent inject extra toolbar items ───────────────────
  toolbarLeading?: ReactNode;
  toolbarTrailing?: ReactNode;

  // ── Styling ─────────────────────────────────────────────────────────────
  className?: string;
  style?: CSSProperties;
  /** Class added to the <textarea> */
  textareaClassName?: string;
  /** Class added to the preview prose container */
  previewClassName?: string;
  /** Rendered when preview pane is empty */
  previewPlaceholder?: ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// AST types (internal)
// ─────────────────────────────────────────────────────────────────────────────

type InlineNode =
  | { type: "text"; value: string }
  | { type: "bold"; children: InlineNode[] }
  | { type: "italic"; children: InlineNode[] }
  | { type: "boldItalic"; children: InlineNode[] }
  | { type: "strike"; children: InlineNode[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: InlineNode[] };

type BlockNode =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "blockquote"; children: BlockNode[] }
  | { type: "codeBlock"; lang: string; value: string }
  | { type: "hr" }
  | { type: "ul"; items: InlineNode[][] }
  | { type: "ol"; items: InlineNode[][] };

// ─────────────────────────────────────────────────────────────────────────────
// Inline parser
// ─────────────────────────────────────────────────────────────────────────────

function parseInline(src: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;
  while (i < src.length) {
    // Inline code
    if (src[i] === "`") {
      const end = src.indexOf("`", i + 1);
      if (end !== -1) {
        nodes.push({ type: "code", value: src.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    // Link [text](href)
    if (src[i] === "[") {
      const cb = src.indexOf("]", i + 1);
      if (cb !== -1 && src[cb + 1] === "(") {
        const cp = src.indexOf(")", cb + 2);
        if (cp !== -1) {
          nodes.push({
            type: "link",
            href: src.slice(cb + 2, cp),
            children: parseInline(src.slice(i + 1, cb)),
          });
          i = cp + 1;
          continue;
        }
      }
    }
    // Bold-italic ***…***
    if (src.startsWith("***", i)) {
      const end = src.indexOf("***", i + 3);
      if (end !== -1) {
        nodes.push({
          type: "boldItalic",
          children: parseInline(src.slice(i + 3, end)),
        });
        i = end + 3;
        continue;
      }
    }
    // Bold **…**
    if (src.startsWith("**", i)) {
      const end = src.indexOf("**", i + 2);
      if (end !== -1) {
        nodes.push({
          type: "bold",
          children: parseInline(src.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }
    // Italic *…* or _…_
    if (src[i] === "*" || src[i] === "_") {
      const end = src.indexOf(src[i], i + 1);
      if (end !== -1) {
        nodes.push({
          type: "italic",
          children: parseInline(src.slice(i + 1, end)),
        });
        i = end + 1;
        continue;
      }
    }
    // Strikethrough ~~…~~
    if (src.startsWith("~~", i)) {
      const end = src.indexOf("~~", i + 2);
      if (end !== -1) {
        nodes.push({
          type: "strike",
          children: parseInline(src.slice(i + 2, end)),
        });
        i = end + 2;
        continue;
      }
    }
    // Plain text
    const TOKENS = ["*", "_", "`", "[", "~"];
    let j = i + 1;
    while (j < src.length && !TOKENS.includes(src[j])) j++;
    nodes.push({ type: "text", value: src.slice(i, j) });
    i = j;
  }
  return nodes;
}

// ─────────────────────────────────────────────────────────────────────────────
// Block parser
// ─────────────────────────────────────────────────────────────────────────────

function parseBlocks(src: string): BlockNode[] {
  const lines = src.split("\n");
  const blocks: BlockNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "codeBlock", lang, value: code.join("\n") });
      continue;
    }

    // Horizontal rule
    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Heading
    const hm = line.match(/^(#{1,6})\s+(.*)/);
    if (hm) {
      blocks.push({
        type: "heading",
        level: hm[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        children: parseInline(hm[2]),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith("> ")) {
      const bq: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith("> ")) {
        bq.push(lines[i].trimStart().slice(2));
        i++;
      }
      blocks.push({ type: "blockquote", children: parseBlocks(bq.join("\n")) });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line.trimStart())) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i].trimStart())) {
        items.push(parseInline(lines[i].trimStart().slice(2)));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: InlineNode[][] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trimStart())) {
        items.push(parseInline(lines[i].trimStart().replace(/^\d+\.\s/, "")));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Paragraph
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|```|> |\d+\.\s|[-*+]\s|(\s*[-*_]){3,}\s*$)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length)
      blocks.push({ type: "paragraph", children: parseInline(para.join(" ")) });
  }
  return blocks;
}

// ─────────────────────────────────────────────────────────────────────────────
// React renderer
// ─────────────────────────────────────────────────────────────────────────────

function renderInline(nodes: InlineNode[], kp: string): ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${kp}-${i}`;
    switch (n.type) {
      case "text":
        return n.value;
      case "bold":
        return <strong key={k}>{renderInline(n.children, k)}</strong>;
      case "italic":
        return <em key={k}>{renderInline(n.children, k)}</em>;
      case "boldItalic":
        return (
          <strong key={k}>
            <em>{renderInline(n.children, k)}</em>
          </strong>
        );
      case "strike":
        return <s key={k}>{renderInline(n.children, k)}</s>;
      case "code":
        return (
          <code key={k} className="md-code">
            {n.value}
          </code>
        );
      case "link":
        return (
          <a
            key={k}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer"
            className="md-link"
          >
            {renderInline(n.children, k)}
          </a>
        );
    }
  });
}

export function renderBlocks(nodes: BlockNode[], kp = "b"): ReactNode[] {
  return nodes.map((n, i) => {
    const k = `${kp}-${i}`;
    switch (n.type) {
      case "heading": {
        const Tag = `h${n.level}` as keyof JSX.IntrinsicElements;
        return (
          <Tag key={k} className={`md-h${n.level}`}>
            {renderInline(n.children, k)}
          </Tag>
        );
      }
      case "paragraph":
        return (
          <p key={k} className="md-p">
            {renderInline(n.children, k)}
          </p>
        );
      case "blockquote":
        return (
          <blockquote key={k} className="md-bq">
            {renderBlocks(n.children, k)}
          </blockquote>
        );
      case "codeBlock":
        return (
          <pre key={k} className="md-pre" data-lang={n.lang || undefined}>
            <code>{n.value}</code>
          </pre>
        );
      case "hr":
        return <hr key={k} className="md-hr" />;
      case "ul":
        return (
          <ul key={k} className="md-ul">
            {n.items.map((it, ii) => (
              <li key={`${k}-${ii}`}>{renderInline(it, `${k}-${ii}`)}</li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol key={k} className="md-ol">
            {n.items.map((it, ii) => (
              <li key={`${k}-${ii}`}>{renderInline(it, `${k}-${ii}`)}</li>
            ))}
          </ol>
        );
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Textarea helpers
// ─────────────────────────────────────────────────────────────────────────────

export function wrapSelection(
  ta: HTMLTextAreaElement,
  before: string,
  after = before,
): string {
  const { selectionStart: s, selectionEnd: e, value } = ta;
  return (
    value.slice(0, s) + before + value.slice(s, e) + after + value.slice(e)
  );
}

export function prefixCurrentLine(
  ta: HTMLTextAreaElement,
  pfx: string,
): { value: string; cursor: number } {
  const { selectionStart, value } = ta;
  const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
  return {
    value: value.slice(0, lineStart) + pfx + value.slice(lineStart),
    cursor: selectionStart + pfx.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Default toolbar definition
// ─────────────────────────────────────────────────────────────────────────────

export interface ToolbarItem {
  kind: "button" | "separator";
  key: string;
  title?: string;
  icon?: ReactNode;
  /** Returns the new markdown string */
  apply?: (ta: HTMLTextAreaElement, current: string) => string;
  /** Optional cursor position after apply (absolute offset) */
  cursor?: (ta: HTMLTextAreaElement, next: string) => number;
}

export const DEFAULT_TOOLBAR_ITEMS: ToolbarItem[] = [
  {
    kind: "button",
    key: "h1",
    title: "Heading 1",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <path d="M4 12h8M4 6v12M12 6v12" />
        <text
          x="15"
          y="14"
          fontSize="9"
          fontWeight="bold"
          fill="currentColor"
          stroke="none"
        >
          1
        </text>
      </svg>
    ),
    apply: (ta) => {
      const r = prefixCurrentLine(ta, "# ");
      return r.value;
    },
    cursor: (ta) => prefixCurrentLine(ta, "# ").cursor,
  },
  {
    kind: "button",
    key: "h2",
    title: "Heading 2",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <path d="M4 12h8M4 6v12M12 6v12" />
        <text
          x="15"
          y="14"
          fontSize="9"
          fontWeight="bold"
          fill="currentColor"
          stroke="none"
        >
          2
        </text>
      </svg>
    ),
    apply: (ta) => prefixCurrentLine(ta, "## ").value,
    cursor: (ta) => prefixCurrentLine(ta, "## ").cursor,
  },
  {
    kind: "button",
    key: "h3",
    title: "Heading 3",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <path d="M4 12h8M4 6v12M12 6v12" />
        <text
          x="15"
          y="14"
          fontSize="9"
          fontWeight="bold"
          fill="currentColor"
          stroke="none"
        >
          3
        </text>
      </svg>
    ),
    apply: (ta) => prefixCurrentLine(ta, "### ").value,
    cursor: (ta) => prefixCurrentLine(ta, "### ").cursor,
  },
  { kind: "separator", key: "sep1" },
  {
    kind: "button",
    key: "bold",
    title: "Bold (⌘B)",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <path d="M6 4h8a4 4 0 010 8H6z" />
        <path d="M6 12h9a4 4 0 010 8H6z" />
      </svg>
    ),
    apply: (ta) => wrapSelection(ta, "**"),
  },
  {
    kind: "button",
    key: "italic",
    title: "Italic (⌘I)",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <line x1="19" y1="4" x2="10" y2="4" />
        <line x1="14" y1="20" x2="5" y2="20" />
        <line x1="15" y1="4" x2="9" y2="20" />
      </svg>
    ),
    apply: (ta) => wrapSelection(ta, "*"),
  },
  {
    kind: "button",
    key: "strike",
    title: "Strikethrough",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <path d="M16 6C16 6 14.5 4 12 4C9.5 4 7.5 5.5 7.5 7.5C7.5 9 8.5 10 10 11" />
        <path d="M8 18C8 18 9.5 20 12 20C14.5 20 16.5 18.5 16.5 16.5C16.5 15 15.5 14 14 13" />
      </svg>
    ),
    apply: (ta) => wrapSelection(ta, "~~"),
  },
  {
    kind: "button",
    key: "inlineCode",
    title: "Inline code",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    apply: (ta) => wrapSelection(ta, "`"),
  },
  { kind: "separator", key: "sep2" },
  {
    kind: "button",
    key: "quote",
    title: "Blockquote",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
      </svg>
    ),
    apply: (ta) => prefixCurrentLine(ta, "> ").value,
    cursor: (ta) => prefixCurrentLine(ta, "> ").cursor,
  },
  {
    kind: "button",
    key: "ul",
    title: "Unordered list",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <line x1="9" y1="6" x2="20" y2="6" />
        <line x1="9" y1="12" x2="20" y2="12" />
        <line x1="9" y1="18" x2="20" y2="18" />
        <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    apply: (ta) => prefixCurrentLine(ta, "- ").value,
    cursor: (ta) => prefixCurrentLine(ta, "- ").cursor,
  },
  {
    kind: "button",
    key: "ol",
    title: "Ordered list",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "1em", height: "1em" }}
      >
        <line x1="10" y1="6" x2="21" y2="6" />
        <line x1="10" y1="12" x2="21" y2="12" />
        <line x1="10" y1="18" x2="21" y2="18" />
        <text
          x="1.5"
          y="8.5"
          fontSize="6.5"
          fill="currentColor"
          stroke="none"
          fontFamily="serif"
        >
          1.
        </text>
        <text
          x="1.5"
          y="14.5"
          fontSize="6.5"
          fill="currentColor"
          stroke="none"
          fontFamily="serif"
        >
          2.
        </text>
        <text
          x="1.5"
          y="20.5"
          fontSize="6.5"
          fill="currentColor"
          stroke="none"
          fontFamily="serif"
        >
          3.
        </text>
      </svg>
    ),
    apply: (ta) => prefixCurrentLine(ta, "1. ").value,
    cursor: (ta) => prefixCurrentLine(ta, "1. ").cursor,
  },
  {
    kind: "button",
    key: "hr",
    title: "Horizontal rule",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        style={{ width: "1em", height: "1em" }}
      >
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
    apply: (ta, _v) => {
      const { selectionStart, value } = ta;
      return (
        value.slice(0, selectionStart) + "\n---\n" + value.slice(selectionStart)
      );
    },
    cursor: (ta) => ta.selectionStart + 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MarkdownEditor component
// ─────────────────────────────────────────────────────────────────────────────

export const MarkdownEditor = forwardRef<
  MarkdownEditorRef,
  MarkdownEditorProps
>(function MarkdownEditor(
  {
    value,
    onChange,
    viewMode = "write",
    textAlign = "left",
    placeholder = "Start writing…",
    readOnly = false,
    onSave,
    toolbarLeading,
    toolbarTrailing,
    className = "",
    style,
    textareaClassName = "",
    previewClassName = "",
    previewPlaceholder,
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getValue: () => value,
    setValue: (md) => onChange(md),
    focus: () => textareaRef.current?.focus(),
  }));

  const ast = useMemo(() => parseBlocks(value), [value]);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const mod = e.metaKey || e.ctrlKey;
      const ta = textareaRef.current!;

      if (mod && e.key === "s") {
        e.preventDefault();
        onSave?.();
        return;
      }

      if (mod && e.key === "b") {
        e.preventDefault();
        onChange(wrapSelection(ta, "**"));
        return;
      }
      if (mod && e.key === "i") {
        e.preventDefault();
        onChange(wrapSelection(ta, "*"));
        return;
      }

      // Smart list continuation on Enter
      if (e.key === "Enter") {
        const { selectionStart, value: v } = ta;
        const lineStart = v.lastIndexOf("\n", selectionStart - 1) + 1;
        const line = v.slice(lineStart, selectionStart);
        const lm = line.match(/^([-*+]|\d+\.)\s/);
        if (lm) {
          if (line.trim() === lm[0].trim()) {
            // Empty item → exit list
            e.preventDefault();
            const nv = v.slice(0, lineStart) + "\n" + v.slice(selectionStart);
            onChange(nv);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = lineStart + 1;
            });
            return;
          }
          e.preventDefault();
          const insert = "\n" + lm[0];
          const nv =
            v.slice(0, selectionStart) + insert + v.slice(selectionStart);
          onChange(nv);
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd =
              selectionStart + insert.length;
          });
        }
      }
    },
    [onChange, onSave],
  );

  // ── Toolbar action dispatcher ───────────────────────────────────────────
  const dispatchToolbarItem = useCallback(
    (item: ToolbarItem) => {
      if (item.kind !== "button" || !item.apply) return;
      const ta = textareaRef.current;
      if (!ta) return;
      const next = item.apply(ta, value);
      const cursor = item.cursor?.(ta, next);
      onChange(next);
      requestAnimationFrame(() => {
        ta.focus();
        if (cursor !== undefined) {
          ta.selectionStart = ta.selectionEnd = cursor;
        }
      });
    },
    [value, onChange],
  );

  const showWrite = viewMode === "write" || viewMode === "split";
  const showPreview = viewMode === "preview" || viewMode === "split";

  return (
    <div className={`md-editor ${className}`} style={style}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="md-editor__toolbar">
          {toolbarLeading}
          {DEFAULT_TOOLBAR_ITEMS.map((item) =>
            item.kind === "separator" ? (
              <span key={item.key} className="md-editor__tool-sep" />
            ) : (
              <button
                key={item.key}
                title={item.title}
                className="md-editor__tool-btn"
                onMouseDown={(e) => {
                  e.preventDefault();
                  dispatchToolbarItem(item);
                }}
              >
                {item.icon}
              </button>
            ),
          )}
          {toolbarTrailing}
        </div>
      )}

      {/* Panes */}
      <div className="md-editor__panes">
        {showWrite && (
          <div
            className={`md-editor__write-pane ${showPreview ? "md-editor__write-pane--split" : ""}`}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                onChange(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              readOnly={readOnly}
              spellCheck
              className={`md-editor__textarea ${textareaClassName}`}
              style={{ textAlign }}
            />
          </div>
        )}

        {showPreview && (
          <div
            className={`md-editor__preview-pane ${showWrite ? "md-editor__preview-pane--split" : ""}`}
          >
            <div className={`md-editor__preview ${previewClassName}`}>
              {value.trim() === ""
                ? (previewPlaceholder ?? (
                    <span className="md-editor__placeholder">
                      Nothing to preview yet.
                    </span>
                  ))
                : renderBlocks(ast)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default MarkdownEditor;
