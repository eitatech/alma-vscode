# webview-shared (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA — leaf shared layer).
> Source: `ui/src/index.tsx`, `page-registry.tsx`, `bridge/vscode.ts`, `components/ui/`, `lib/utils.ts`, `utils/relative-time.ts` (~450 LOC, 12 files). Complexity: low.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-shared` is the cross-cutting webview infrastructure consumed by **every** other webview module: the single-bundle entry point, the runtime `data-page` → component router, the VS Code `postMessage` bridge (with a dev fallback), VS Code-themed primitives (Button, VSCodeSelect, VSCodeCheckbox, icon/pill buttons, auto-grow textarea), and shared utilities (`cn`, `formatRelativeTime`, `toFriendlyName`). 🟢

## Responsabilidades

- Bootstrap the single Vite bundle; pick the active page from `#root[data-page]`. 🟢
- Resolve the VS Code bridge once (real or dev echo fallback). 🟢
- Provide themed primitives + class-merge + relative-time/friendly-name utilities. 🟢
- Render "Unknown page" for unregistered `data-page` values (no throw). 🟢

## Regras de Negócio

- **R-X-1** (host-side counterpart) Single Vite bundle; active page from `#root[data-page]` (default `simple`). 🟢 `index.tsx:10`
- Unknown `data-page` → visible "Unknown page" (no throw). 🟢 `index.tsx:16`; `page-registry.tsx:108`
- Bridge resolves once at import; outside VS Code → dev echo (`openspec.chat/echoResult` after 50 ms; `getState→{}`, `setState→no-op`). 🟢 `bridge/vscode.ts:18`
- `cn = twMerge(clsx(...))`. 🟢 `lib/utils.ts:4`
- `formatRelativeTime`: <60 s `just now`; <60 m `Nm`; <24 h `Nh`; <7 d `Nd`; else `N wk`. 🟢 `relative-time.ts:16`
- 11 registered pages; `getPageRenderer` returns `undefined` for unknown. 🟢 `page-registry.tsx:107`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Bootstrap + page select | Must | `createRoot`; `data-page` (default simple); render renderer or "Unknown page" |
| RF-02 | Page registry | Must | `SupportedPage` union (11); lazy/code-split renderers |
| RF-03 | Bridge resolution | Must | `acquireVsCodeApi` once; dev echo fallback |
| RF-04 | Themed primitives | Must | Button (CVA), VSCodeSelect/Checkbox, icon/pill, TextareaPanel |
| RF-05 | Utilities | Should | `cn`, `formatRelativeTime`, `toFriendlyName` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Per-page code splitting via lazy imports | `page-registry.tsx:107` | 🟢 |
| Robustez | Unknown page + missing bridge degrade gracefully | `index.tsx:16`; `bridge/vscode.ts:18` | 🟢 |
| Consistência | All primitives map VS Code theme CSS variables | `components/ui/*` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado #root com data-page="agent-chat"
Quando index.tsx carrega
Então o renderer lazy de agent-chat é montado (RF-01, RF-02)

Dado um data-page não registrado
Quando index.tsx carrega
Então "Unknown page: <name>" é exibido sem lançar (RF-01)

Dado execução fora do VS Code
Quando o bridge é importado
Então um dev echo é instalado (postMessage → echoResult após 50ms) (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Bootstrap + registry + bridge + primitives (RF-01–RF-04) | Must | The foundation of every webview |
| Utilities (RF-05) | Should | Shared helpers |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `index.tsx` | bootstrap (10,16) | 🟢 |
| `page-registry.tsx` | `getPageRenderer` (107) + 11 pages | 🟢 |
| `bridge/vscode.ts` | `vscode` (47), dev fallback (18) | 🟢 |
| `components/ui/*` | `Button` (37), `VSCodeSelect`/`VSCodeCheckbox` | 🟢 |
| `lib/utils.ts` / `utils/relative-time.ts` | `cn` (4) / `formatRelativeTime` (12) | 🟢 |

> See `questions.md` for the 🔴 missing page-registry entries + the dev-echo residual.
