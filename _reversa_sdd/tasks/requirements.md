# tasks (module)

> Module-level `requirements.md`. Bounded context: **Spec Lifecycle** (task normalization).
> Source: `src/features/tasks/` (~348 LOC, 5 files). Complexity: low.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`tasks` is a **pluggable task-source layer** that reads `tasks.md` from either SDD system and normalizes entries into a common `NormalizedTask` shape consumed by the Kanban board (webview) and the `orchestration` autonomous loop. Providers register by name; the right one is selected per file path. The actual markdown parsing is delegated to `utils/task-parser`. 🟢

## Responsabilidades

- Define the `NormalizedTask` contract + the `TaskProvider` interface. 🟢
- Register built-in providers (SpecKit, OpenSpec) and select by `canHandle(filePath)`. 🟢
- Resolve a spec's `tasks.md` via the spec adapter, dispatch to the matching provider. 🟢
- Normalize parsed groups → `NormalizedTask[]` (scoped ids, status/execution mapping). 🟢
- Degrade gracefully: unsupported/unparseable files yield a single placeholder task. 🟢

## Regras de Negócio

- **R-SP-13** Provider selection is path-based: `openspec/` ⇒ OpenSpec; `.specify`/`specs/` (not openspec) ⇒ SpecKit. Task ids spec-scoped: `${specId}-${task.id}`. 🟢 `speckit-task-provider.ts:12-17,55`; `openspec-task-provider.ts:12-14,52`
- Parse status mapping: `completed`→completed, `in-progress`→in-progress, else→not-started; execution state similarly mapped. 🟢 `speckit-task-provider.ts:78-99`
- No matching provider ⇒ a single `isUnsupported` placeholder task. 🟢 `task-service.ts:44-58`
- Parse failure ⇒ a single "Failed to parse tasks.md" `isUnsupported` task. 🟢 `speckit-task-provider.ts:27-42`
- `getTasksForSpec` resolves the tasks path via `SpecSystemAdapter.getSpecFiles`; missing ⇒ empty list. 🟢 `task-service.ts:23-33`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Define NormalizedTask + provider interface | Must | types compile and match the data-dictionary |
| RF-02 | Register + select providers | Must | first provider whose `canHandle` matches handles the file (R-SP-13) |
| RF-03 | Resolve + dispatch | Must | `getTasksForSpec` resolves path then dispatches; missing path → empty |
| RF-04 | Normalize groups | Must | flatten parsed groups → `NormalizedTask[]`, ids scoped `${specId}-${id}` |
| RF-05 | Graceful degradation | Must | unsupported / parse-failure → single placeholder task, no throw |
| RF-06 | Status + execution mapping | Must | parse status → normalized status + seed execution state |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Extensibilidade | New SDD systems add a `TaskProvider` without touching the service | `task-service.ts:15` | 🟢 |
| Resiliência | Unsupported/unparseable files never throw (placeholder task) | `task-service.ts:44-58` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um filePath contendo openspec/
Quando getTasksFromFile é chamado
Então o OpenSpecTaskProvider o processa (R-SP-13)

Dado um tasks.md malformado
Quando o provider tenta parsear
Então uma única task placeholder "Failed to parse" é retornada (sem exceção)

Dado um spec sem tasks file resolvível
Quando getTasksForSpec é chamado
Então retorna lista vazia
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Interface + dispatch + normalize + degrade (RF-01–RF-06) | Must | The whole task-source layer |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `task-model.ts` | `NormalizedTask`, `TaskProvider`, `ExecutionState`, `NormalizedTaskStatus` | 🟢 |
| `task-service.ts` | `getTasksForSpec` (23), `getTasksFromFile` (38), `registerProvider` (15), `getTaskService` (67) | 🟢 |
| `speckit-task-provider.ts` | `canHandle` (12), `getTasks` (19), `normalizeGroups` (45) | 🟢 |
| `openspec-task-provider.ts` | `canHandle` (12), `getTasks` (16), `normalizeGroups` (42) | 🟢 |
