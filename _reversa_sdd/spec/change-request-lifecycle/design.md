# change-request-lifecycle, Design Técnico

> HOW CRs flow. Source: `review-flow/state.ts`, `change-requests-service.ts`, `tasks-dispatch.ts`, `flowcharts/spec.md` §3–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `createChangeRequest` | `(specId, input)` | `ChangeRequest` | dedupe→add→reopen — `change-requests-service.ts:34` |
| `addChangeRequest` | `(specId, cr)` | `ChangeRequest` | `state.ts:351` |
| `attachTasksToChangeRequest` | `(specId, crId, links)` | — | `state.ts:768` |
| `updateTaskStatus` | `(specId, crId, taskId, status)` | — | `state.ts:824` |
| `shouldReturnToReview` / `returnSpecToReview` | auto-return | bool / transition | `state.ts:447/477` |
| `dispatchToTasksPrompt` | `(payload)` | `TasksPromptResponse` | 🔴 mock — `tasks-dispatch.ts:76` |

## Fluxo Principal (§3)

1. **create** — `validateUniqueChangeRequest` (normalized title, exclude `addressed`); add CR `open` + `archivalBlocker=true`; if spec in review → `reopened`. 🟢
2. **attach tasks** — `attachTasksToChangeRequest` sets `sentToTasksAt`, CR → `inProgress`, blocker on. 🟢
3. **task completion** — `updateTaskStatus`; when all tasks `done` → CR `addressed`, blocker cleared. 🟢
4. **revert** — a done task reverted → CR back to `inProgress`, blocker on. 🟢
5. **auto-return** — `shouldReturnToReview` (all CRs addressed ∧ all tasks done ∧ zero pending) → `returnSpecToReview`. 🟢

## Dispatch flow (§4, 🔴 mock)

`dispatch-to-tasks` command → `buildTasksPromptPayload(spec, CR)` → `dispatchToTasksPrompt` (**mock**: 500–1500 ms latency, 10% random fail, returns 2 hard-coded tasks) → `convertResponseToTaskLinks` → `attachTasksToChangeRequest`. 🔴 `tasks-dispatch.ts:76-134`

## Dependências

- The FSM, `duplicate-guard`, the dispatch payload builder, telemetry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Archival blockers tied to CR status | `state.ts:799,853-867` | 🟢 |
| Normalized-title dedup excluding addressed | `duplicate-guard.ts:24` | 🟢 |
| Auto-return composed of 3 independent conditions | `state.ts:447` | 🟢 |

## Estado Interno

CRs live in `Specification.changeRequests[]`; each CR has `tasks: TaskLink[]` and `archivalBlocker`. 🟢

## Observabilidade

CR status-change + dispatch telemetry (success/failure). 🟢

## Riscos e Lacunas

- 🔴 The tasks producer is a mock; real generation is unwired (see `../questions.md`).
