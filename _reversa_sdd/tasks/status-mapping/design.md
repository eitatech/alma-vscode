# status-mapping, Design Técnico

> HOW normalization + mapping work. Source: `*-task-provider.ts` `normalizeGroups`, `flowcharts/tasks.md` §3–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecKitTaskProvider.normalizeGroups` | `(specId, groups)` | `NormalizedTask[]` | `:45` |
| `OpenSpecTaskProvider.normalizeGroups` | `(specId, groups)` | `NormalizedTask[]` | `:42` |

## Fluxo Principal (§3)

1. Flatten parsed `TaskGroup[]` → individual tasks. 🟢
2. Scope id: `${specId}-${task.id}`. 🟢
3. Map status:
   - `completed` → `completed`
   - `in-progress` → `in-progress`
   - else → `not-started`. 🟢
4. Seed execution state:
   - `completed` → `completed`
   - `in-progress` → `running`
   - else → `ready`. 🟢
5. Populate `source` (system, filePath, line?) + `metadata` (phase/priority/complexity if parsed). 🟢

## Execution lifecycle (§4)

`queued → ready → running → blocked → completed/failed/skipped`. Providers seed the initial state; `orchestration/autonomous-task-loop` advances `running → completed/failed`. 🟢

## Dependências

- `utils/task-parser` output (`TaskGroup[]`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Status and execution state are seeded independently from the same parse status | `speckit-task-provider.ts:78-99` | 🟢 |

## Estado Interno

None (pure transform). 🟢

## Observabilidade

None. 🟢

## Riscos e Lacunas

- 🟡 `failed`/`blocked`/`skipped` normalized statuses exist but the parse→status map only emits completed/in-progress/not-started — those states arrive via orchestration, not parsing.
