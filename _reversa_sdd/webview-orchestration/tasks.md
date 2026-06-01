# webview-orchestration (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` + `webview-hooks-view` (`Hook` types + `HookForm`)
- [ ] `@xyflow/react`; extension `orchestration`/`tasks`/`cloud-agents`/`devin` contracts
- [ ] 🔴 Decide fate of unmounted prototypes (see `questions.md`)

## Tarefas

- [ ] T-01, Implement `OrchestrationFeature` (snapshot lanes + empty-state)
  - Origem no legado: `orchestration/index.tsx:79,60,106,112`
  - Critério de pronto: ready→snapshot→4 lanes; degraded empty-state decision tree; session actions
  - Confiança: 🟢

- [ ] T-02, Implement `WorkflowComposerFeature` + `mapHooksToGraph`
  - Origem no legado: `workflow-composer/index.tsx:22,87`; `mapper.ts:168`
  - Critério de pronto: hooks→graph; node click → HookForm; create/update; not auto-closed
  - Confiança: 🟢

- [ ] T-03, Implement React Flow graph + node types
  - Origem no legado: `components/workflow-graph/*`; `components/workflow/*`
  - Critério de pronto: Source/Condition/Schedule/Action nodes + handles; deterministic layout
  - Confiança: 🟢

- [ ] T-04, (Conditional) Implement / wire Kanban + progress views
  - Origem no legado: `components/kanban/*`; `components/{devin,cloud-agents}/*` + stores
  - Critério de pronto: ONLY if registered in `page-registry.tsx` (see `questions.md`); else omit as dead code
  - Confiança: 🔴

## Tarefas de Teste

- [ ] TT-01, Snapshot → 4 bucket lanes (RF-01)
- [ ] TT-02, Empty-state first-match decision tree (RF-02)
- [ ] TT-03, mapHooksToGraph skips schedule on immediate (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.
2. T-04 only after the unmounted-prototype decision.

## Lacunas Pendentes (🔴)

- 🔴 Register or remove Kanban + `devin-progress`/`cloud-agent-progress` pages (see `questions.md`).
