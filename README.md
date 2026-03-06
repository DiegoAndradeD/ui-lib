# Personal UI Library (Headless + Tailwind v4)

A highly customized, lightweight, and scalable React UI library built with a **Core/Wrapper architecture**.

This repository serves as my personal toolkit for UI components. It is built from scratch to avoid repeating code across different projects while maintaining maximum performance and full control over the DOM.

## Motivation & Architecture

Inspired by libraries like [TanStack](https://tanstack.com/) and [Shadcn UI](https://ui.shadcn.com/), this project follows a strict separation of concerns:

1. **The Core (`src/core/`)**: 100% Vanilla TypeScript. It handles all complex business logic, event listeners, accessibility (A11y), intersection observers (for infinite scrolling), and state management. It is framework-agnostic.
2. **The Wrapper (`src/react/`)**: A thin React layer that handles the DOM injection and styling using **Tailwind CSS v4**. It communicates with the Vanilla core without causing unnecessary React re-renders.

### Why is this not on NPM?
Currently, this is a personal ecosystem designed to speed up my own workflow. It is not published to the public NPM registry because it's tailored to my specific needs and design tokens. However, the architecture is fully prepared to be published in the future if the library grows to a mature state.

## Features
* **Zero Heavy Dependencies:** No external dependencies or components, no heavy UI frameworks.
* **Headless Logic:** The brain of the components lives in Vanilla TS.
* **Tailwind v4:** Uses the latest CSS-first Tailwind engine with CSS variable tokens (Zinc palette) for seamless Light/Dark mode transitions.
* **Built-in Smart Select:** A highly optimized combobox with native debounce and native infinite scrolling using `IntersectionObserver`.

---

## How to use this library in other projects

Since this package is not published on NPM, we use the `npm pack` method to generate a local binary.

### 1. Build and Pack the Library
Clone this repository and run the following commands to generate the distributable package:

```bash
npm install
npm run build
npm pack
