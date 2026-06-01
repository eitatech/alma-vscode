# preview-lifecycle (use-case)

> Use-case under `webview-preview`. load-document → render sections → interactive mounts + click delegation.
> Source: `features/preview/preview-app.tsx`, `flowcharts/webview-preview.md` §1–§2.

## Visão Geral

On mount, posts `preview/ready`, subscribes to the preview store, and on `load-document` renders sections (or code mode), mounts Mermaid diagrams, and shows form/update banners. Two delegated document click listeners handle task-group buttons and internal `.md` links. 🟢

## Responsabilidades

- `ready` handshake; handle `load-document` / `show-placeholder`. 🟢
- Render sections via `renderPreviewMarkdown` (or `CodePreview` in code mode); fallback when no metadata. 🟢
- Mount Mermaid into `.mermaid` nodes (hashed ids, 100 ms delay). 🟢
- Render `PreviewFormContainer` when forms present; `UpdateDocumentButton` when outdated. 🟢
- Delegate clicks: task-group buttons → `execute-task-group`; `.md` links → `open-file`. 🟢

## Regras de Negócio

- Mermaid mounts into `.mermaid:not([data-processed])` after 100 ms; id `mermaid-<djb2hash>-<i>`. 🟢 `preview-app.tsx:162,178`
- Internal `.md` link → `preventDefault` + `preview/open-file`; `Phase N:` button → `preview/execute-task-group`. 🟢 `preview-app.tsx:79,63`
- No metadata → `PreviewFallback` ('No document selected' → open-in-editor). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Ready + load | Must | `preview/ready`; `load-document` → setDocument; `show-placeholder` → markStale |
| RF-02 | Section / code render | Must | sections via markdown; code mode → CodePreview; fallback when no metadata |
| RF-03 | Mermaid mount | Must | per-diagram createRoot into `.mermaid` with hashed id |
| RF-04 | Forms / update banner | Should | PreviewFormContainer when forms; UpdateDocumentButton when isOutdated |
| RF-05 | Click delegation | Should | task-group + `.md` link delegated |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Limpeza | Mermaid roots unmounted on cleanup | `preview-app.tsx:162` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um load-document com seções e um fence mermaid
Quando renderizado
Então as seções viram HTML e o diagrama monta num nó .mermaid com id hasheado (RF-02, RF-03)

Dado um link interno para "design.md"
Quando clicado
Então preventDefault + preview/open-file é postado (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Ready+render+mermaid (RF-01–RF-03) | Must | The preview core |
| Forms/banner/clicks (RF-04, RF-05) | Should | Interactivity |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/preview/preview-app.tsx` | `PreviewApp` (91), mermaid (162,178), click (57-88) | 🟢 |
| `features/preview/stores/preview-store.ts` | `setDocument`/`markStale` | 🟢 |
