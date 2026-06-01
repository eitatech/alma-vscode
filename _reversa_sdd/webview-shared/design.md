# webview-shared (module), Design Técnico

> Module-level `design.md`. Source: see requirements. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getPageRenderer` | `(pageName)` | renderer \| undefined | `page-registry.tsx:107` |
| `vscode` | resolved API | `{ postMessage, getState, setState }` | `bridge/vscode.ts:47` |
| `Button` (+ `buttonVariants`) | CVA props | JSX | `ui/button.tsx:37` |
| `VSCodeSelect` / `VSCodeCheckbox` | themed controls | JSX | `ui/vscode-select.tsx:35` / `vscode-checkbox.tsx:28` |
| `TextareaPanel` | auto-grow textarea | JSX | `textarea-panel.tsx:26` |
| `cn` / `formatRelativeTime` | utilities | string | `lib/utils.ts:4` / `relative-time.ts:12` |

## Registered pages (11)

`simple`, `interactive`, `create-spec`, `create-steering`, `hooks`, `document-preview`, `welcome-screen`, `agent-chat`, `orchestration`, `workflow-composer` (+ the `SupportedPage` union). 🟢

> 🔴 `devin-progress` / `cloud-agent-progress` are requested by panels but **not** registered (→ "Unknown page"). See `questions.md`.

## Fluxo Principal (visão de módulo)

1. **Bootstrap** — `createRoot` → `data-page` → `getPageRenderer` → lazy feature or "Unknown page". 🟢 (→ `bootstrap-page-selection/`)
2. **Bridge** — `acquireVsCodeApi` once (or dev echo). 🟢 (→ `bridge-resolution/`)
3. **Primitives** — themed Button/Select/Checkbox/textarea + `cn`/time/name utils. 🟢 (→ `themed-primitives/`)

## State machines

None — stateless infrastructure + presentational primitives. See `flowcharts/webview-shared.md` §1–§5. 🟢

## Dependências

- Internal: none (leaf layer). Consumed by **all** webview modules. 🟢
- External: `react`/`react-dom`, `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`, `@vscode/codicons`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single bundle + runtime `data-page` routing (code-split) | `index.tsx:10`; `vite.config.ts:6` | 🟢 |
| Bridge resolved once at import with a dev fallback | `bridge/vscode.ts:18` | 🟢 |
| CVA-driven themed primitives mapping VS Code CSS vars | `components/ui/*` | 🟢 |

## Estado Interno

None (the resolved `vscode` is a module singleton). 🟢

## Observabilidade

"Unknown page" fallback is the visible diagnostic. 🟡

## Riscos e Lacunas

- 🔴 `devin-progress`/`cloud-agent-progress` pages missing from the registry — panels render "Unknown page" (see `questions.md`; webview-orchestration §4).
- 🟡 The dev-echo fallback targets `openspec.chat/echoResult` — a residual identifier from the `kiro-for-codex-ide` fork lineage.
- 🟡 `webview-spec-explorer` deliberately bypasses this bridge with its own `acquireVsCodeApi()` (R-X-6 drift, tracked there).
