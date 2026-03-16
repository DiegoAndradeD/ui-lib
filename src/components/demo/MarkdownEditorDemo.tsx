import { useState } from "react";
import { MarkdownEditor, type ViewMode } from "../ui/MarkdownEditor";
import { ComponentCard } from "../ComponentCard";

const INITIAL_MARKDOWN = `# Welcome to the Editor
This is a **fully typed**, zero-dependency markdown editor.

## Features Supported
- Bold, *italic*, and ~~strikethrough~~
- [Links to external sites](https://github.com)
- Inline \`code\` blocks

> "Markdown is a lightweight markup language with plain-text-formatting syntax."

### Code Blocks
\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet('Developer');
\`\`\`

---
1. It supports ordered lists
2. Smart list continuation on Enter
3. Keyboard shortcuts (⌘B, ⌘I)
`;

export function MarkdownEditorDemo() {
  const [content1, setContent1] = useState(INITIAL_MARKDOWN);
  const [content2, setContent2] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  return (
    <div className="w-full flex flex-col gap-8">
      <ComponentCard
        title="Split View (Default)"
        description="Side-by-side editing and rendering. Try editing the text and using the toolbar."
      >
        <div className="w-full mx-auto">
          <MarkdownEditor
            value={content1}
            onChange={setContent1}
            viewMode="split"
            className="min-h-100 shadow-sm"
          />
        </div>
      </ComponentCard>

      <ComponentCard
        title="Controlled View Modes"
        description="Switch between Write, Preview, and Split modes dynamically."
      >
        <div className="w-full flex flex-col gap-4">
          <div className="flex p-1 bg-muted rounded-md w-fit mx-auto md:mx-0">
            {(["write", "split", "preview"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-1.5 text-sm font-medium rounded-sm capitalize transition-colors ${
                  viewMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <MarkdownEditor
            value={content2}
            onChange={setContent2}
            viewMode={viewMode}
            placeholder="Comece a digitar aqui para testar os modos de visualização..."
            className="min-h-75"
          />
        </div>
      </ComponentCard>

      <ComponentCard
        title="Read-Only Mode"
        description="Useful for rendering markdown content in your app without allowing edits."
      >
        <div className="w-full max-w-2xl mx-auto">
          <MarkdownEditor
            value="### Read-Only Render&#10;This component can also be used purely as a **Markdown Renderer**. Since \`readOnly\` is true, the toolbar and text area are completely hidden/locked."
            onChange={() => {}}
            viewMode="preview"
            readOnly={true}
            className="border-none bg-transparent"
          />
        </div>
      </ComponentCard>
    </div>
  );
}
