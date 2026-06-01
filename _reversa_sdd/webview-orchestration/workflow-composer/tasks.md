# workflow-composer, Tarefas de Implementação

## Pré-requisitos

- [ ] `@xyflow/react`; `webview-hooks-view` `Hook` types + `HookForm`; dual-keyed hooks bridge

## Tarefas

- [ ] T-01, Implement hooks load + sync
  - Origem no legado: `workflow-composer/index.tsx:22,31,42`
  - Critério de pronto: ready+list (dual-keyed); `hooks/sync` → setHooks
  - Confiança: 🟢

- [ ] T-02, Implement `mapHooksToGraph`
  - Origem no legado: `utils/mapper.ts:168,99,131,139`
  - Critério de pronto: deterministic layout; schedule skipped on immediate; edges fan-in
  - Confiança: 🟢

- [ ] T-03, Implement ReactFlow render + node click → HookForm
  - Origem no legado: `components/workflow-graph/*`; `workflow-composer/index.tsx:87`
  - Critério de pronto: 4 node types; node click opens form; create/update; not auto-closed
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, immediate schedule skipped (RF-02)
- [ ] TT-02, node click opens HookForm (RF-03)
- [ ] TT-03, submit → create/update + sync refresh (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
