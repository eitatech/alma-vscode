# bootstrap-page-selection, Design Técnico

> HOW bootstrap + routing work. Source: `index.tsx`, `page-registry.tsx`, `flowcharts/webview-shared.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `getPageRenderer` | `(pageName)` | renderer \| undefined | `page-registry.tsx:107` |
| `SupportedPage` | union | type | 11 pages |

## Fluxo Principal (§1)

1. `index.tsx` → `createRoot(#root)`. 🟢
2. `page = container.dataset.page ?? 'simple'`. 🟢
3. `getPageRenderer(pageName)` → `pageName in pageRenderers`? no → render "Unknown page: name"; yes → `withSuspense(lazy(import))`. 🟢
4. code-split chunk loads → feature mounts + opens its own bridge channel. 🟢

## Registered pages

`simple · interactive · create-spec · create-steering · hooks · document-preview · welcome-screen · agent-chat · orchestration · workflow-composer` (+ union). 🟢

## Algorithm

**Runtime page routing** — `pageName in pageRenderers` guard → `withSuspense(lazy import)`; per-page code splitting. 🟢

## Dependências

- `react` lazy/Suspense; the feature modules (lazy). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| One bundle, runtime page selection | `index.tsx:10`; `vite.config.ts:6` | 🟢 |
| Unknown-page visible fallback (no throw) | `page-registry.tsx:108` | 🟢 |

## Estado Interno

None. 🟢

## Observabilidade

"Unknown page" message. 🟡

## Riscos e Lacunas

- 🔴 Panels can set a `data-page` not in the registry → "Unknown page" (the `devin-progress`/`cloud-agent-progress` gap). See `../questions.md`.
