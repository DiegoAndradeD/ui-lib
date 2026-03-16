# ui-lib

A personal, copy-and-paste React UI component library built with TypeScript and Tailwind CSS v4. Heavily inspired by the [shadcn/ui](https://ui.shadcn.com/) philosophy.

This is not a component library you install via npm. It's a collection of reusable, highly customizable components that you copy and paste directly into your projects. **You own the code.**

## 🚀 Features

* **Zero Lock-in:** Copy the code, paste it, and modify it however you want.
* **Modern Stack:** Built entirely with React and TypeScript.
* **Tailwind CSS v4:** Styled using the latest Tailwind features, relying on CSS variables and `@theme` directives instead of complex config files.
* **No Animation Libraries:** Advanced visual effects (like gooey, shine, and expanding icons) are built using pure CSS.
* **Accessible & Scalable:** Designed with robust HTML attributes and a consistent BEM-like class structure where needed.

---

## 🛠️ Local Development (Showcase)

This repository includes a built-in showcase environment powered by Vite to test and visualize components.

1. **Install dependencies:**
   ```bash
   npm install

```

2. **Start the development server:**
```bash
npm run dev

```


3. Open `http://localhost:5173` to view the component playground.

---

## 📦 How to Use in Your Projects

To adopt these components in any of your React + Tailwind v4 projects, follow these steps:

### 1. Install core utilities

Most components rely on a simple utility function to merge Tailwind classes efficiently.

```bash
npm install clsx tailwind-merge

```

### 2. Add the `cn` utility

Create a `utils.ts` file in your project (e.g., `src/lib/utils.ts`) and add the following:

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

```

### 3. Copy & Paste

Browse the components below, copy the corresponding `.tsx` file from `src/components/ui/`, and paste it into your project. That's it!

---

## 🧩 Component Catalog

Here are the components currently available in the library.

### Button

A highly versatile button component with built-in loading states, icon support, and pure CSS visual effects (ring hover, shine, gooey, underline).

> **[Insert Preview Image Here]**

```tsx
// Example Usage
import { Button } from "@/components/ui/Button";

export default function App() {
  return (
    <Button effect="expandIcon" icon={<ArrowRightIcon />} iconPlacement="right">
      Continue
    </Button>
  );
}

```

### Input

A customizable text input with support for variants (default, flat, underlined, outline), start/end content slots for icons, and automatic loading spinners.

> **[Insert Preview Image Here]**

```tsx
// Example Usage
import { Input } from "@/components/ui/Input";

export default function App() {
  return (
    <Input
      type="password"
      placeholder="Enter password"
      startContent={<LockIcon />}
    />
  );
}

```

### Single Select

A robust, searchable select dropdown. It features local filtering, infinite scroll pagination (via Intersection Observer), keyboard navigation, and click-outside handling.

> **[Insert Preview Image Here]**

```tsx
// Example Usage
import SingleSelect from "@/components/ui/SingleSelect";

// ... see full implementation in the showcase

```

### Multi Select

An advanced multi-select dropdown featuring checkbox visuals, tag chip rendering, overflow badges (e.g., "+3 more"), search capabilities, and keyboard accessibility.

> **[Insert Preview Image Here]**

```tsx
// Example Usage
import MultiSelect from "@/components/ui/MultiSelect";

// ... see full implementation in the showcase

```

### Markdown Editor

A **zero-dependency** markdown editor and renderer. It includes a custom built-in AST parser, a formatting toolbar, keyboard shortcuts (⌘B, ⌘I), smart list continuation, and split/preview view modes.

> **[Insert Preview Image Here]**

*Note: This component requires specific CSS classes to style the rendered prose. Make sure to copy the `.md-editor` styles from `src/index.css`.*

```tsx
// Example Usage
import MarkdownEditor from "@/components/ui/MarkdownEditor";

export default function App() {
  return (
    <MarkdownEditor
      value={content}
      onChange={setContent}
      viewMode="split"
    />
  );
}

```

---

## 🚧 Coming Soon (Future Components)

This library is actively growing. Planned components include:

* [ ] **Modal / Dialog:** Accessible overlay windows.
* [ ] **Toast / Snackbar:** Lightweight notification system.
* [ ] **Tabs:** Content switching interface.
* [ ] **Accordion:** Collapsible content panels.

---

## 🤝 Contributing

Since this is a personal library designed for copy-pasting, the best way to contribute is to fork it, adapt it to your own style, and build your own UI system!
