# themed-primitives, Design Técnico

> HOW the primitives + utils work. Source: `components/ui/*`, `textarea-panel.tsx`, `lib/utils.ts`, `utils/relative-time.ts`, `flowcharts/webview-shared.md` §3–§5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `Button` / `buttonVariants` | CVA props | JSX | `ui/button.tsx:37` |
| `VSCodeSelect` / `VSCodeCheckbox` | themed controls | JSX | `ui/vscode-select.tsx:35` / `vscode-checkbox.tsx:28` |
| `TextareaPanel` | auto-grow | JSX | `textarea-panel.tsx:26` |
| `cn` | `(...classes)` | string | `lib/utils.ts:4` |
| `formatRelativeTime` | `(timestamp)` | label | `relative-time.ts:12` |
| `toFriendlyName` | `(filename)` | title | `document-title-utils.ts` |

## Primitives (§3)

- `Button` — CVA variants (default/destructive/outline/secondary/ghost/link) × size. 🟢
- `VSCodeSelect` — label/required/desc/error + custom arrow. 🟢
- `VSCodeCheckbox` — indeterminate, sizes, SVG check. 🟢
- `icon-button` (circular 24px), `pill-button` (toolbar action). 🟢
- `TextareaPanel` — `useLayoutEffect` resets height to `auto` then `scrollHeight`. 🟢

## Utilities (§4–§5)

- `cn = twMerge(clsx(...))`. 🟢
- `formatRelativeTime` — cascade `just now`/`Nm`/`Nh`/`Nd`/`N wk`. 🟢
- `toFriendlyName` — basename → strip ext → strip `NNN-` → `-`/`_`→space → Title-Case. 🟢

## Dependências

- `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@vscode/codicons`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| CVA-driven theming over VS Code CSS variables | `components/ui/*` | 🟢 |
| `cn` for Tailwind class merge | `lib/utils.ts:4` | 🟢 |

## Estado Interno

TextareaPanel tracks its own height; otherwise stateless. 🟢

## Observabilidade

None (presentational). 🟢

## Riscos e Lacunas

None. 🟢
