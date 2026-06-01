# preview-lifecycle, Design Técnico

> HOW the preview renders. Source: `features/preview/preview-app.tsx`, `flowcharts/webview-preview.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `PreviewApp` | `()` | JSX | `:91` |
| `PreviewStore.setDocument` / `markStale` | store mutation | — | `preview-store.ts` |

## Fluxo Principal (§1)

1. mount → `addEventListener('message')` + document click handlers → `postMessage('preview/ready')`. 🟢
2. `preview/load-document` → `setDocument`; `preview/show-placeholder` → `markStale(reason)`. 🟢
3. `useSyncExternalStore` re-render. 🟢
4. metadata present? no → `PreviewFallback`. yes → `renderStandard == 'code'`? → `CodePreview`; else → `sections.map(renderPreviewMarkdown)` → `dangerouslySetInnerHTML`. 🟢
5. effect on `metadata.sections`: `mermaid.initialize` + scan `.mermaid:not([data-processed])` → per diagram: hash id, `createRoot`, render `MermaidViewer`. 🟢
6. `metadata.forms.length > 0` → `PreviewFormContainer`; `metadata.isOutdated` → `UpdateDocumentButton`. 🟢

## Click delegation (§2)

- BUTTON with `data-execute-task-group` → `postMessage preview/execute-task-group(groupName)`. 🟢
- A with non-http href ending `.md` → `preventDefault` + `postMessage preview/open-file(filePath)`. 🟢

## Dependências

- `webview-shared` bridge; `mermaid`; `renderPreviewMarkdown`; `MermaidViewer`/`CodePreview`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| React-mounted Mermaid into static HTML | `preview-app.tsx:162` | 🟢 |
| Delegated document listeners (not per-element) | `preview-app.tsx:57-88` | 🟢 |

## Estado Interno

`PreviewStore` (document, stale); mounted mermaid roots. 🟢

## Observabilidade

Fallback messaging. 🟡

## Riscos e Lacunas

None. 🟢
