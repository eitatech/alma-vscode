# markdown-pipeline (use-case)

> Use-case under `webview-preview`. The cached markdown-it renderer + 3 custom plugins.
> Source: `lib/markdown/preview-renderer.ts`, `lib/markdown/plugins/*`, `flowcharts/webview-preview.md` §5.

## Visão Geral

A cached singleton `markdown-it` (html/linkify/typographer + highlight.js) with three custom plugins: GitHub task-list checkboxes, a `Phase N:` h2 → Execute-Group button injector, and a mermaid/plantuml fence override (mermaid emitted raw so `-->` survives). 🟢

## Responsabilidades

- Provide `renderPreviewMarkdown` (reuse cached renderer; `createPreviewRenderer` for custom options). 🟢
- Apply plugins in order: checkbox → task-group → mermaid. 🟢
- Emit raw mermaid fence content (sanitized later in `MermaidViewer`). 🟢

## Regras de Negócio

- Cached singleton renderer (html, linkify, typographer; highlight.js with auto-detect fallback). 🟢 `preview-renderer.ts:39`
- `taskGroupPlugin`: core ruler scans h2 matching `/Phase N:/` → inject Execute-Group button with `data-execute-task-group`. 🟢 `task-group-plugin.ts:81`
- `mermaidPlugin`: fence override → `pre.mermaid` raw; `plantuml` → `pre.plantuml` escaped. 🟢 `mermaid-plugin.ts:23`
- `checkboxPlugin`: GitHub task-list checkboxes. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cached renderer | Must | reuse cached singleton; custom options → `createPreviewRenderer` |
| RF-02 | Checkbox plugin | Should | GitHub task-list rendering |
| RF-03 | Task-group plugin | Must | `Phase N:` h2 → Execute-Group button (data-execute-task-group) |
| RF-04 | Mermaid/plantuml fence | Must | mermaid raw (`-->` survives); plantuml escaped |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Cached singleton avoids re-instantiating markdown-it | `preview-renderer.ts:39` | 🟢 |
| Segurança | Raw mermaid fence is sanitized downstream in MermaidViewer | `mermaid-plugin.ts:23` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um h2 "Phase 2: Build"
Quando renderizado
Então um botão Execute-Group com data-execute-task-group é injetado (RF-03)

Dado uma fence ```mermaid contendo "A --> B"
Quando renderizada
Então o conteúdo é emitido raw (a seta sobrevive) para sanitização posterior (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Renderer + task-group + mermaid (RF-01, RF-03, RF-04) | Must | Core rendering + interactivity |
| Checkbox (RF-02) | Should | Task-list display |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `lib/markdown/preview-renderer.ts` | `createPreviewRenderer` (39), `renderPreviewMarkdown` (58) | 🟢 |
| `lib/markdown/plugins/{task-group,mermaid,checkbox}-plugin.ts` | plugins | 🟢 |
