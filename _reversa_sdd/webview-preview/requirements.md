# webview-preview (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA).
> Source: `ui/src/features/preview/`, `ui/src/components/{preview,refine,forms}/`, `ui/src/lib/markdown/` (~3,150 LOC, ~22 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-preview` is the document-preview surface (page `document-preview`). It renders SpecKit/markdown documents into sectioned HTML, mounts interactive Mermaid diagrams into the static markup, and hosts three host round-trips: manual **refinement** (issue report), dependency-triggered **document update**, and embedded **interactive forms** with client-side validation. Also supports a raw "code" render mode + a table-of-contents outline. 🟢

## Responsabilidades

- Subscribe to `previewStore`; render sections (or code mode) from the document payload. 🟢
- Mount Mermaid diagrams into `.mermaid` nodes after render. 🟢
- Delegate global clicks (task-group buttons, internal `.md` links). 🟢
- Drive refine/update round-trips + interactive forms (validation + submit). 🟢

## Regras de Negócio

- Mermaid mounts into `.mermaid:not([data-processed])` after 100 ms; id = `mermaid-<djb2hash>-<i>`. 🟢 `preview-app.tsx:162,178`
- Refine + form bridges correlate by `requestId` (`crypto.randomUUID` fallback), 10 s timeout. 🟢 `refine-bridge.ts:84`; `form-bridge.ts:85`
- `submitForm` rejects immediately when no fields changed. 🟢 `form-bridge.ts:79`
- Field validation: required, dropdown/multiselect option membership, `minLength`/`maxLength`/`pattern`. 🟢 `form-store.ts:177,197,228`
- `prepareSubmission` requires documentId+sessionId, non-read-only, `validateAll` pass, ≥1 dirty. 🟢 `form-store.ts:355`
- Read-only mode (`permissions.canEditForms === false`) blocks updateField + submission. 🟢 `form-store.ts:133`
- `RefineDialog`: issueType required + description ≥ 20 chars. 🟢 `refine-dialog.tsx:30,66`
- Internal `.md` links → `preview/open-file`; `Phase N:` buttons → `preview/execute-task-group`. 🟢 `preview-app.tsx:79,63`
- Mermaid plugin emits **raw** fence content (so `-->` survives); sanitized in `MermaidViewer`. 🟢 `mermaid-plugin.ts:23`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Load + render | Must | `load-document` → sections (or code mode); fallback when no metadata |
| RF-02 | Mermaid mount | Must | diagrams mounted into `.mermaid` nodes with stable hashed ids |
| RF-03 | Click delegation | Should | task-group buttons + internal `.md` links delegated |
| RF-04 | Refinement / update | Should | RefineDialog (≥20 chars) + UpdateDocumentButton → `submitRefinement` (10 s) |
| RF-05 | Interactive form | Should | init → validate → submit (FSM); read-only blocks; 0-dirty rejects |
| RF-06 | Markdown pipeline | Must | markdown-it + checkbox/task-group/mermaid plugins |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Mermaid content sanitized in MermaidViewer before render | `mermaid-plugin.ts:23` | 🟢 |
| Resiliência | Bridges time out (10 s) and reject pending | `refine-bridge.ts:87` | 🟢 |
| Performance | Cached singleton markdown renderer | `preview-renderer.ts:39` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um documento markdown com fences mermaid
Quando renderizado
Então as seções viram HTML e os diagramas montam em nós .mermaid com ids hasheados (RF-01, RF-02)

Dado o RefineDialog com descrição < 20 chars
Quando submete
Então o submit é bloqueado com erro inline (RF-04)

Dado um form sem campos alterados
Quando submitForm é chamado
Então rejeita imediatamente (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load+render+mermaid+markdown (RF-01, RF-02, RF-06) | Must | The preview core |
| Click/refine/form (RF-03–RF-05) | Should | Interactivity |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/preview/preview-app.tsx` | `PreviewApp` (91) | 🟢 |
| `features/preview/stores/form-store.ts` | `validateField` (174), `prepareSubmission` (345) | 🟢 |
| `features/preview/api/{refine,form}-bridge.ts` | `submitRefinement` (79), `submitForm` (76) | 🟢 |
| `lib/markdown/preview-renderer.ts` | `renderPreviewMarkdown` (58) | 🟢 |
| `lib/markdown/plugins/*` | task-group/mermaid/checkbox plugins | 🟢 |
