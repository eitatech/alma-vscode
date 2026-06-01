# tasks (module), Design Técnico

> Module-level `design.md`. Source: `src/features/tasks/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `TaskService.getTasksForSpec` | `(specId)` | `Promise<NormalizedTask[]>` | resolve + dispatch — `task-service.ts:23` |
| `TaskService.getTasksFromFile` | `(specId, filePath)` | `Promise<NormalizedTask[]>` | provider match + fallback — `:38` |
| `TaskService.registerProvider` | `(provider)` | `void` | `:15` |
| `getTaskService` | `()` | `TaskService` | singleton — `:67` |
| `TaskProvider.canHandle` / `getTasks` | path test / parse | `boolean` / `Promise<NormalizedTask[]>` | per provider |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `NormalizedTask` | `task-model.ts:40` | `id` (`${specId}-${task.id}`), `title`, `status`, `source: {system, filePath, line?, isUnsupported?}`, `metadata: {phase?, priority?, complexity?}`, `execution?: TaskExecutionMetadata` |
| `TaskExecutionMetadata` | `task-model.ts:14` | `{ state: ExecutionState, intent?, suggestedRole?, parallelizable?, dependsOn?, errorMessage?, startedAt?, completedAt? }` |
| `ExecutionState` | `task-model.ts:5` | `queued\|ready\|running\|blocked\|completed\|failed\|skipped` |
| `NormalizedTaskStatus` | `task-model.ts:28` | `completed\|in-progress\|not-started\|failed\|blocked\|skipped` |
| `TaskProvider` | `task-model.ts:58` | `{ name; canHandle(filePath); getTasks(specId, filePath) }` |

## Fluxo Principal (visão de módulo)

1. `getTasksForSpec(specId)` resolves the `tasks` file path via `SpecSystemAdapter.getSpecFiles`; missing → empty. 🟢 (→ `resolve-and-dispatch/`)
2. `getTasksFromFile` finds the provider where `canHandle(filePath)`; none → placeholder. 🟢 (→ `provider-selection/`)
3. The provider parses via `utils/task-parser` and `normalizeGroups` → `NormalizedTask[]` (scoped ids, status/execution mapping). 🟢 (→ `status-mapping/`)

## State machines

- **Execution state** (consumed by orchestration): `queued → ready → running → blocked → completed/failed/skipped`. Providers seed from parse status; the autonomous loop advances `running → completed/failed`. 🟢 `flowcharts/tasks.md` §4
- **Normalized status**: `not-started | in-progress | completed | failed | blocked | skipped`. 🟢

## Dependências

- `utils` (`task-parser` — the actual markdown parser, `spec-kit-adapter`), `constants` (`SPEC_SYSTEM_MODE`). 🟢
- Consumed by `orchestration` (autonomous loop), `providers`/`panels` (Kanban), `webview-orchestration`. 🟢
- External: none beyond `utils`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Provider/strategy pattern keyed by path | `task-service.ts`; `*-task-provider.ts:12` | 🟢 |
| Spec-scoped task ids for global uniqueness | `speckit-task-provider.ts:55` | 🟢 |
| Placeholder-task degradation instead of throwing | `task-service.ts:44-58` | 🟢 |
| Parsing delegated to `utils/task-parser` (dual-format) | `flowcharts/tasks.md` §1 | 🟢 |

## Estado Interno

`TaskService` holds the registered providers list (singleton). No persistence. 🟢

## Observabilidade

Unsupported/parse-failure surfaced as placeholder tasks (visible in the board). 🟡

## Riscos e Lacunas

- 🟡 SpecKit and OpenSpec providers have near-identical normalize logic — a candidate for shared extraction (no functional gap).
