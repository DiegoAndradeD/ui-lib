# ui-lib

A personal, copy-and-paste React UI component library built with TypeScript and Tailwind CSS v4, inspired by the [shadcn/ui](https://ui.shadcn.com/) philosophy.

## 🚀 Features

* **Copy and Paste:** No npm packages to install for the components. Just copy the source code and own it.
* **Modern Stack:** Built with React, TypeScript, and Vite.
* **Tailwind v4:** Styled using the latest Tailwind CSS version without the need for a configuration file.
* **Fully Customizable:** Since the code lives directly in your target project, you can tweak every detail without restrictions.

## 📁 Structure

* `src/components/ui/` - The home for all reusable, standalone components.
* `src/lib/utils.ts` - Contains the essential `cn` utility function (using `clsx` and `tailwind-merge`) to merge classes dynamically.
* `src/App.tsx` - The local showcase environment to test and view the components.

## 🛠️ Local Development

To run the showcase environment locally and build new components:

1. Install dependencies:
   ```bash
   npm install
