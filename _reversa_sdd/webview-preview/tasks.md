# webview-preview (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; `markdown-it`, `highlight.js`, `mermaid`, React 18
- [ ] Extension `document-preview-panel` message contract

## Tarefas

- [ ] T-01, Implement `PreviewApp` (store + sections + mermaid mount + click delegation)
  - Origem no legado: `preview-app.tsx:91,57-88,162-178`
  - Critério de pronto: load-document → sections/code; mermaid mount; task-group + `.md` link delegation
  - Confiança: 🟢

- [ ] T-02, Implement the markdown renderer + 3 plugins
  - Origem no legado: `preview-renderer.ts:39,58`; `plugins/*`
  - Critério de pronto: cached markdown-it; checkbox/task-group/mermaid plugins (raw mermaid fence)
  - Confiança: 🟢

- [ ] T-03, Implement refine/update bridges + dialogs
  - Origem no legado: `refine-bridge.ts:79`; `refine-dialog.tsx`; `update-document-button.tsx`
  - Critério de pronto: requestId + 10 s; ≥20-char validation; dependency-update banner
  - Confiança: 🟢

- [ ] T-04, Implement `FormStore` FSM + form bridge + container
  - Origem no legado: `form-store.ts:133,174,293,345`; `form-bridge.ts:76`; `preview-form-container.tsx:49`
  - Critério de pronto: validation engine; read-only gating; 0-dirty reject; submit FSM
  - Confiança: 🟢

- [ ] T-05, Implement MermaidViewer / CodePreview / DocumentOutline
  - Origem no legado: `components/preview/*`
  - Critério de pronto: sanitized mermaid render; code highlight; TOC overlay
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Document renders sections + mounts mermaid (RF-01, RF-02)
- [ ] TT-02, RefineDialog <20 chars blocked (RF-04)
- [ ] TT-03, 0-dirty form submit rejects (RF-05)
- [ ] TT-04, Read-only blocks updateField (RF-05)

## Ordem Sugerida

1. T-02 (renderer) → T-01 (app) → T-05 (viewers) → T-03 (refine) → T-04 (forms).

## Lacunas Pendentes (🔴)

None. 🟡 confirm `preview-form-container` is the intended production host.
