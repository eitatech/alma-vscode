# ADR-0002: Dual-build — esbuild extension host + Vite React webview

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
The product has two runtime environments with incompatible constraints: the **Node.js extension host** (needs a fast single-file Node bundle) and the **browser webview** (a React 18 SPA needing JSX, CSS, code-splitting). A single bundler/config serves neither well.

## Decision
Use **two independent build pipelines**:
- Extension host → **esbuild** (`src/extension.ts` → `dist/extension.js`, `--target=node16`).
- Webview → **Vite** (`ui/` → single bundle, lazy/code-split pages).
- Dependencies are installed in **two** package roots (`/` and `/ui`); `npm run install:all` covers both. A markdown-prompt compile step (`build-prompts`) precedes the extension bundle.

## Evidence
- `package.json` scripts `build:ext` (esbuild), `build:webview` (Vite), `build-prompts`; `ui/vite.config.ts`.
- `inventory.md` §5; `dependencies.md` "Dual bundler strategy".
- Vitest config aliases resolve both dependency trees for tests.

## Consequences
- Each side is optimized for its target; webview gets HMR/dev-server.
- The two worlds **cannot import each other's modules** → forces a contract boundary (see ADR-0003) and type mirroring + parity tests.
- Two `node_modules` trees increase install footprint and the chance of version drift (e.g. React 18.3 vs 18.2).
