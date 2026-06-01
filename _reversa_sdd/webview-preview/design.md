# webview-preview (module), Design Técnico

> Module-level `design.md`. Source: see requirements. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `PreviewApp` | `()` | JSX | orchestrator — `preview-app.tsx:91` |
| `submitRefinement` | `(payload)` | `Promise` | requestId + 10 s — `refine-bridge.ts:79` |
| `submitForm` | `(payload)` | `Promise` | rejects on 0 dirty — `form-bridge.ts:76` |
| `FormStore.validateField` / `prepareSubmission` / `validateAll` | validation | errors / gate | `form-store.ts:174/345/293` |
| `renderPreviewMarkdown` / `createPreviewRenderer` | markdown | HTML / renderer | `preview-renderer.ts:58/39` |
| `taskGroupPlugin` | core ruler | tokens | `task-group-plugin.ts:81` |

## Tipos

`features/preview/types.ts`: `DocumentArtifact`/`PreviewDocumentPayload`, `PreviewFormField`, refinement/form payloads, dual message unions. 🟢

## Fluxo Principal (visão de módulo)

1. **Lifecycle** — load-document → render sections / code → mount mermaid → forms/update banners. 🟢 (→ `preview-lifecycle/`)
2. **Refinement** — RefineDialog / UpdateDocumentButton → `submitRefinement`. 🟢 (→ `refinement-flow/`)
3. **Form** — init → validate → submit FSM. 🟢 (→ `interactive-form/`)
4. **Markdown** — markdown-it + 3 plugins. 🟢 (→ `markdown-pipeline/`)

## State machines

Form lifecycle FSM (`form-store.ts`): `empty → initialized → dirty ⇄ submitting → submitted` (`reset` → empty); read-only blocks transitions. See `flowcharts/webview-preview.md` §4. 🟢

## Dependências

- `webview-shared` (`@/bridge/vscode`, `components/ui/button`, `lib/document-title-utils`). Crosses to extension `document-preview-panel`. 🟢
- External: `markdown-it`, `highlight.js`, `mermaid`, `lucide-react`, `react`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| React-mounted Mermaid into static markdown HTML | `preview-app.tsx:162` | 🟢 |
| Request/response bridges with requestId + 10 s timeout | `refine-bridge.ts:84` | 🟢 |
| Singleton FormStore FSM with read-only gating | `form-store.ts` | 🟢 |
| Cached markdown-it + custom plugins (raw mermaid fences) | `preview-renderer.ts:39`; `mermaid-plugin.ts:23` | 🟢 |

## Estado Interno

`PreviewStore` (document/stale), `FormStore` (fields/dirty/errors), bridge `pending` maps. 🟢

## Observabilidade

Refine confirmation; form submit result. 🟡

## Riscos e Lacunas

- 🟡 `preview-form-container.tsx` self-documents as an "example / reference implementation" yet is the production form host — confirm it is intended as such.
