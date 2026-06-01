# resolve-and-dispatch, Tarefas de Implementação

## Pré-requisitos

- [ ] `task-model` + providers registered (see `../tasks.md`)
- [ ] `utils/spec-kit-adapter.getSpecFiles` + `utils/task-parser`

## Tarefas

- [ ] T-01, Implement `getTasksForSpec` (resolve path → dispatch)
  - Origem no legado: `task-service.ts:23-33`
  - Critério de pronto: resolves via adapter; missing → empty
  - Confiança: 🟢

- [ ] T-02, Implement `getTasksFromFile` (provider match + fallbacks)
  - Origem no legado: `task-service.ts:38,44-58`
  - Critério de pronto: first `canHandle` provider handles; none → placeholder; parse throw → placeholder
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Resolvable spec returns NormalizedTask[]
- [ ] TT-02, No provider → isUnsupported placeholder
- [ ] TT-03, Missing path → empty list

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
