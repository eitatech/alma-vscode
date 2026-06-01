# change-request-lifecycle (use-case)

> Use-case under `spec`. Change-request creation, task linkage, archival blocking, dispatch, auto-return.
> Source: `review-flow/state.ts`, `change-requests-service.ts`, `duplicate-guard.ts`, `tasks-dispatch.ts`, `flowcharts/spec.md` §3–§4.

## Visão Geral

Manages the change-request (CR) lifecycle against a spec in review: create with duplicate-prevention (reopening the spec), attach tasks (which may be dispatched to a tasks generator — 🔴 currently a mock), track CR status (`open → inProgress → addressed`), block archival while open, and auto-return the spec to review when all CRs are addressed. 🟢/🔴

## Responsabilidades

- Create a CR with normalized-title dedup; transition the spec to `reopened`. 🟢
- Set `archivalBlocker=true` on a new/`inProgress` CR; clear it when `addressed`. 🟢
- Attach task links (via dispatch); mark `inProgress`; on all tasks done → `addressed`. 🟢
- Re-open an `addressed` CR if a done task is reverted. 🟢
- Auto-return the spec to review when all CRs addressed + tasks done + zero pending. 🟢
- Dispatch CR → tasks (🔴 mock producer today). 🔴

## Regras de Negócio

- **R-SP-4** New CR `open` + `archivalBlocker=true`; create in review → `reopened`; attach tasks → `inProgress`; all done → `addressed`, blocker cleared. 🟢 `change-requests-service.ts:64-71`; `state.ts:799,853-867`
- **R-SP-7** Auto-return: all CRs addressed + tasks done + zero pending → review. 🟢 `state.ts:447`
- **R-SP-8** Duplicate CRs rejected by normalized title (excluding `addressed`). 🟢 `duplicate-guard.ts:24-50`
- 🔴 `dispatchToTasksPrompt` is a mock (latency + 10% fail + 2 hard-coded tasks). 🔴 `tasks-dispatch.ts:76-134`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Create CR + dedupe + reopen | Must | dup title rejected; new CR `open`+blocker; spec → reopened (R-SP-4, R-SP-8) |
| RF-02 | Attach tasks → inProgress | Must | `attachTasksToChangeRequest` sets `sentToTasksAt`, CR `inProgress`, blocker on |
| RF-03 | All tasks done → addressed | Must | CR `addressed`, blocker cleared (R-SP-4) |
| RF-04 | Revert reopens CR | Should | a reverted done task → CR back to `inProgress`, blocker on |
| RF-05 | Auto-return to review | Should | all addressed + tasks done + zero pending → review (R-SP-7) |
| RF-06 | Dispatch CR→tasks | Should | build payload, dispatch (🔴 mock), convert to task links |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Integridade | Archival blockers prevent archiving an unresolved CR | `state.ts:694-708` | 🟢 |
| Resiliência | Dispatch failure is logged as retryable (mock) | `tasks-dispatch.ts` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado um spec em review
Quando um change request é criado
Então o spec vai para reopened e o CR é open com archivalBlocker=true (R-SP-4)

Dado um CR inProgress cujas tasks são todas concluídas
Quando o status é reavaliado
Então o CR vira addressed e o blocker é limpo (R-SP-4)

Dado todos os CRs addressed, tasks done e zero pendências
Quando shouldReturnToReview avalia
Então o spec retorna para review (R-SP-7)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Create/attach/addressed/auto-return (RF-01–RF-05) | Must | The CR workflow |
| Dispatch (RF-06) | Should | 🔴 mock; needs a real generator |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `change-requests-service.ts` | `createChangeRequest` (34) | 🟢 |
| `duplicate-guard.ts` | `validateUniqueChangeRequest` (53), `normalizeTitle` (13) | 🟢 |
| `review-flow/state.ts` | `addChangeRequest` (351), `attachTasksToChangeRequest` (768), `updateTaskStatus` (824), `shouldReturnToReview`/`returnSpecToReview` (447/477) | 🟢 |
| `review-flow/tasks-dispatch.ts` | `dispatchToTasksPrompt` (76) | 🔴 mock |
