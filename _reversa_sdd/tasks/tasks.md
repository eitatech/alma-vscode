# tasks (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `utils/task-parser` (dual-format `tasks.md` parser) + `utils/spec-kit-adapter`
- [ ] `constants.SPEC_SYSTEM_MODE`

## Tarefas

- [ ] T-01, Define `task-model.ts` contracts
  - Origem no legado: `task-model.ts:5,14,28,40,58`
  - Critério de pronto: `NormalizedTask`, `TaskExecutionMetadata`, `ExecutionState`, `NormalizedTaskStatus`, `TaskProvider` compile
  - Confiança: 🟢

- [ ] T-02, Implement `TaskService` (register + resolve + dispatch + singleton)
  - Origem no legado: `task-service.ts:15,23,38,67`
  - Critério de pronto: resolves path via adapter; dispatches to `canHandle` provider; unsupported placeholder fallback
  - Confiança: 🟢

- [ ] T-03, Implement SpecKit + OpenSpec providers
  - Origem no legado: `speckit-task-provider.ts:12,19,45`; `openspec-task-provider.ts:12,16,42`
  - Critério de pronto: path-based `canHandle`; parse + normalize; scoped ids; status/execution mapping (R-SP-13)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, openspec/ path → OpenSpec provider; .specify/specs → SpecKit (R-SP-13)
- [ ] TT-02, Parse failure → single placeholder task (no throw)
- [ ] TT-03, Missing tasks path → empty list
- [ ] TT-04, Scoped ids `${specId}-${id}` (R-SP-13)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
