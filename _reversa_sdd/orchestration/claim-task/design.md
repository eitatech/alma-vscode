# claim-task, Design Técnico

> HOW eligibility works. Source: `autonomous-agent-loop.ts:35-51`, `flowcharts/orchestration.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AutonomousAgentLoopService.claimTask` | `(task: NormalizedTask)` | `boolean` | `:35` |

## Fluxo Principal (§4)

1. If `task.execution.state` is `running` or `completed` → return false. 🟢
2. If another task is running:
   - `task.execution.parallelizable` false → return false. 🟢
   - true → continue. 🟢
3. Clone the task, set `execution.state = queued`, add to `activeTasks`. 🟢
4. `onDidChange.fire()`; return true. 🟢

## Fluxos Alternativos

- **No task running:** proceed straight to clone+queue. 🟢

## Dependências

- `tasks` `NormalizedTask` (`execution: TaskExecutionMetadata`); the in-memory `activeTasks` map. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single-running-task default unless `parallelizable` | `autonomous-agent-loop.ts:43` | 🟢 |
| Clone before mutating (immutability of the source task) | `:51` | 🟢 |

## Estado Interno

Adds to `activeTasks: Map<taskId, NormalizedTask>`. 🟢

## Observabilidade

`onDidChange` fired on successful claim. 🟢

## Riscos e Lacunas

- 🟡 "Another task running" is evaluated over `activeTasks`; semantics of multiple parallelizable tasks running together are simple (no max concurrency cap observed).
