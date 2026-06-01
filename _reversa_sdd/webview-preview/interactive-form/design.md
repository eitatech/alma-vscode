# interactive-form, Design Técnico

> HOW the form FSM works. Source: `form-store.ts`, `form-bridge.ts`, `components/forms/*`, `flowcharts/webview-preview.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `FormStore.initializeFields` | `(documentId, sessionId, fields, readOnly)` | — | → initialized |
| `FormStore.updateField` / `validateField` | field ops | — / errors | `:174` |
| `FormStore.prepareSubmission` / `validateAll` | submit gate | bool | `:345/293` |
| `submitForm` | `(payload)` | `Promise` | rejects 0-dirty — `form-bridge.ts:76` |

## State machine (§4)

`empty → initialized` (initializeFields) → `dirty` (updateField, not readOnly/editable) → `submitting` (prepareSubmission OK) → `submitted` (bridge resolves → markSubmitted, clear dirty, stamp lastSubmittedAt). `dirty` on validateAll fail (validationErrors). `submitting → dirty` on reject/timeout. `initialized → empty` on reset (unmount / new document). readOnly blocks updateField + prepareSubmission. submitForm rejects when 0 dirty; 10 s timeout. 🟢

## Validation engine

Per-field rule cascade → `validationErrors`: required; dropdown/multiselect option membership; custom `minLength`/`maxLength`/`pattern`. `validateAll` recomputes all before submit. 🟢

## Dependências

- `webview-shared` bridge; `PreviewFormContainer` (type-routed field render). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Singleton FormStore FSM | `form-store.ts` | 🟢 |
| Submit gated by ids + !readOnly + validateAll + ≥1 dirty | `form-store.ts:355` | 🟢 |

## Estado Interno

fields, dirty set, validationErrors, documentId/sessionId, readOnlyMode, lastSubmittedAt. 🟢

## Observabilidade

Submit result; validation errors. 🟡

## Riscos e Lacunas

- 🟡 `preview-form-container.tsx` self-labels as a "reference implementation" yet is the production host (see module `design.md`).
