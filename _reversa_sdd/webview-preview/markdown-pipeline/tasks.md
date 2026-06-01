# markdown-pipeline, Tarefas de Implementação

## Pré-requisitos

- [ ] `markdown-it`, `highlight.js`

## Tarefas

- [ ] T-01, Implement cached renderer factory
  - Origem no legado: `preview-renderer.ts:39,58`
  - Critério de pronto: cached singleton; opt-in custom renderer; html/linkify/typographer + highlight
  - Confiança: 🟢

- [ ] T-02, Implement the 3 plugins (order: checkbox → task-group → mermaid)
  - Origem no legado: `plugins/{checkbox,task-group,mermaid}-plugin.ts`
  - Critério de pronto: checkboxes; `Phase N:` button; mermaid raw / plantuml escaped
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, `Phase N:` h2 → Execute-Group button (RF-03)
- [ ] TT-02, mermaid fence emitted raw (RF-04)
- [ ] TT-03, custom options → fresh renderer (RF-01)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
