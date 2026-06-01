# status-mapping, Tarefas de Implementação

## Pré-requisitos

- [ ] `utils/task-parser` producing `TaskGroup[]`
- [ ] `NormalizedTask` + enums defined (see `../tasks.md` T-01)

## Tarefas

- [ ] T-01, Implement `normalizeGroups` (flatten + scope ids)
  - Origem no legado: `speckit-task-provider.ts:45`; `openspec-task-provider.ts:42`
  - Critério de pronto: groups flattened; ids `${specId}-${id}`; provenance populated
  - Confiança: 🟢

- [ ] T-02, Implement status + execution-state mapping
  - Origem no legado: `speckit-task-provider.ts:78-99`
  - Critério de pronto: completed/in-progress/else → status; → completed/running/ready execution seed
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, in-progress → status in-progress + execution running
- [ ] TT-02, completed → completed + execution completed
- [ ] TT-03, scoped id `${specId}-${id}`

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
