# Full-Stack To-Do Application (Express + React + Vite)

A full-stack To-Do and Task Analytics web application built with an Express/SQLite REST API backend and a React + Redux Toolkit + Vite TypeScript frontend.

## Accessibility (a11y) Improvements

- **Automated Auditing (`@axe-core/react`):** Integrated `@axe-core/react` in development mode (`client/src/main.tsx`) to run real-time WCAG accessibility checks against the rendered DOM.
- **Semantic Landmarks & Structure:** Organized page layout using semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, and `<section>`) so all content is contained within proper regions and each view exposes a single `<main>` landmark.
- **Heading Hierarchy:** Maintained a sequential heading structure (`<h1>` for main page titles to `<h2>` for dashboard summary and chart cards).
- **Accessible Labels & Controls:** Added descriptive `aria-label` attributes to authentication inputs, task creation inputs, task completion checkboxes, delete buttons, and Chart.js visualizations, as well as `aria-pressed` states on navigation and task filter buttons (`All`, `Active`, `Completed`) and `role="alert"` on error messages.
- **Audit Verification:** Retested across the Sign In/Register, Tasks, and Statistics Dashboard views in Chrome/Edge DevTools to confirm **zero** `axe` violations.

---

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.