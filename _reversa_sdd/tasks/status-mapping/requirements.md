# status-mapping (use-case)

> Use-case under `tasks`. Map parsed task status → normalized status + seed execution state.
> Source: `*-task-provider.ts` `normalizeGroups`, `flowcharts/tasks.md` §3–§4.

## Visão Geral

Normalizes parsed `TaskGroup[]` into `NormalizedTask[]`, scoping ids and mapping parse status to a `NormalizedTaskStatus` and an initial `ExecutionState` (consumed by the orchestration loop). 🟢

## Responsabilidades

- Flatten parsed groups to `NormalizedTask[]`. 🟢
- Scope ids: `${specId}-${task.id}`. 🟢
- Map status: `completed`→completed, `in-progress`→in-progress, else→not-started. 🟢
- Seed execution: `completed`→completed, `in-progress`→running, else→ready. 🟢

## Regras de Negócio

- Status map + execution-state seed per parse status. 🟢 `speckit-task-provider.ts:78-99`
- Execution lifecycle (downstream): `queued → ready → running → blocked → completed/failed/skipped`; the loop advances `running → completed/failed`. 🟢 `flowcharts/tasks.md` §4

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Flatten + scope ids | Must | groups flattened; ids `${specId}-${id}` |
| RF-02 | Status mapping | Must | completed/in-progress/else → normalized status |
| RF-03 | Execution seed | Must | completed→completed, in-progress→running, else→ready |
| RF-04 | Carry provenance | Should | `source: {system, filePath, line?}` populated |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Interoperabilidade | The seeded `ExecutionState` is what orchestration's loop consumes | `flowcharts/tasks.md` §4 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma task parseada com status in-progress
Quando normalizada
Então status = in-progress e execution.state = running

Dado uma task parseada com status completed no spec 001
Quando normalizada
Então id = "001-<taskId>", status = completed, execution.state = completed
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Flatten + map + seed (RF-01–RF-03) | Must | The normalization contract |
| Provenance (RF-04) | Should | Navigation back to source |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `speckit-task-provider.ts` | `normalizeGroups` (45), status/exec map (78-99) | 🟢 |
| `openspec-task-provider.ts` | `normalizeGroups` (42) | 🟢 |
