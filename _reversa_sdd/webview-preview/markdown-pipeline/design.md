# markdown-pipeline, Design Técnico

> HOW the renderer works. Source: `lib/markdown/preview-renderer.ts`, `plugins/*`, `flowcharts/webview-preview.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `renderPreviewMarkdown` | `(content, options?)` | HTML | `:58` |
| `createPreviewRenderer` | `(options)` | `MarkdownIt` | `:39` |
| `taskGroupPlugin` | `(md)` | — | core ruler — `task-group-plugin.ts:81` |

## Fluxo Principal (§5)

1. `renderPreviewMarkdown(content)` → custom options? no → reuse `cachedRenderer`; yes → `createPreviewRenderer(options)`. 🟢
2. `md.use` plugins in order:
   - `checkboxPlugin` — GitHub task-list checkboxes. 🟢
   - `taskGroupPlugin` — core ruler: h2 matching `/Phase N:/` injects Execute-Group button (`data-execute-task-group`). 🟢
   - `mermaidPlugin` — fence override: `mermaid` → `pre.mermaid` raw; `plantuml` → `pre.plantuml` escaped. 🟢
3. `md.render` → HTML string → `dangerouslySetInnerHTML` in `PreviewApp`. 🟢

## Algorithm

- **Markdown rendering** — cached singleton `MarkdownIt` (html/linkify/typographer + highlight.js auto-detect fallback). 🟢
- Core ruler scans tokens for `Phase N:` h2 to inject buttons; fence override for mermaid/plantuml. 🟢

## Dependências

- `markdown-it`, `highlight.js`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Cached singleton + opt-in custom renderer | `preview-renderer.ts:39` | 🟢 |
| Raw mermaid fence (sanitized downstream) | `mermaid-plugin.ts:23` | 🟢 |

## Estado Interno

`cachedRenderer` singleton. 🟢

## Observabilidade

None (pure rendering). 🟢

## Riscos e Lacunas

- 🟡 `dangerouslySetInnerHTML` relies on downstream sanitization (MermaidViewer) for diagram content; non-mermaid HTML comes from trusted document sources.
