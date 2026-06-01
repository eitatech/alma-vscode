# spec (module)

> Module-level `requirements.md`. Bounded context: **Spec Lifecycle**. Spec lineage: `001-auto-review-transition`.
> Source: `src/features/spec/` (~3,635 LOC, 17 files). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`spec` manages the lifecycle of Spec-Driven Development specs across **two systems** (SpecKit `.specify/` and OpenSpec `openspec/`, selected via adapter/strategy) and the **review-flow state machine**. It owns spec creation (webview input → Copilot Chat prompt), document navigation/CRUD, unified cross-system listing, the status FSM (`current → review → reopened → archived`), the change-request lifecycle with archival blockers, task dispatch from change requests, auto-review transitions, and telemetry. Review-flow state persists to `.vscode/gatomia/spec-review-state.json`. 🟢

## Responsabilidades

- Detect the active SDD system and submit specs via the right strategy (OpenSpec/SpecKit). 🟢
- Enforce the spec status FSM with validated transitions + legacy alias normalization. 🟢
- Gate send-to-review (no pending tasks/checklist) and archive (no blockers). 🟢
- Manage change requests (dedupe, archival blockers, task linkage, auto-return to review). 🟢
- Dispatch a change request to a tasks generator (🔴 currently a mock). 🟢/🔴
- Drive create-spec webview input and document open/navigate/delete. 🟢
- Fire SDD-operation hook triggers; persist + telemeter review-flow state. 🟢

## Regras de Negócio

- **R-SP-1** FSM strictly validated; invalid transitions rejected; `readyToReview` is a legacy alias normalized to `review`. 🟢 `review-flow/state.ts:135-151,287`
- **R-SP-2** Send-to-review gate: `current`/`reopened` with **zero** pending tasks AND checklist items. 🟢 `state.ts:887-929`
- **R-SP-3** First `review` entry stamps `completedAt` + `reviewEnteredAt`; `archived` entry stamps `archivedAt`. 🟢 `state.ts:299-306`
- **R-SP-4** New change request is `open` + `archivalBlocker=true`; filing one in review → `reopened`; attach tasks → `inProgress`; all tasks done → `addressed`, blocker cleared. 🟢 `change-requests-service.ts:64-71`; `state.ts:371-378,799,853-867`
- **R-SP-5** Archive gate: review status + zero pending + no blocking change requests; unarchive → `reopened`. 🟢 `state.ts:694-758`
- **R-SP-6** Pending tasks/checklist during review force exit (`reopened` if blockers else `current`) with warning. 🟢 `state.ts:522-544`
- **R-SP-7** Auto-return to review: all CRs addressed AND all tasks done AND zero pending (with retry queue). 🟢 `state.ts:447,552-587`
- **R-SP-8** Duplicate change requests rejected by normalized title (excluding `addressed`). 🟢 `duplicate-guard.ts:24-50`
- **R-SP-9** Active spec system: explicit `gatomia.specSystem` wins; else auto-detect; both present + no preference → prompt + persist (cancel ⇒ default SpecKit). 🟢 `spec-manager.ts:130`
- **R-SP-12** OpenSpec submission requires `.github/prompts/openspec-proposal.prompt.md`; prompt instructs the agent to STOP for user approval. 🟢 `spec-submission-strategy.ts:20-44`
- Review-flow state persisted to `.vscode/gatomia/spec-review-state.json` (load-on-first-access, write-after-mutation). 🟢 `state.ts:56-123`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Status FSM | Must | `updateSpecStatus` accepts only valid transitions; `readyToReview`→`review` (R-SP-1) |
| RF-02 | Send-to-review gating | Must | blocked unless current/reopened + zero pending (R-SP-2) |
| RF-03 | Timestamp stamping | Must | review/archived entries stamp the right dates (R-SP-3) |
| RF-04 | Change-request lifecycle | Must | create→reopened; attach→inProgress; done→addressed (R-SP-4) |
| RF-05 | Archive gating | Must | review + zero pending + no blockers; unarchive→reopened (R-SP-5) |
| RF-06 | Auto-return to review | Should | all CRs addressed + tasks done + zero pending → review (R-SP-7) |
| RF-07 | Duplicate CR guard | Must | normalized-title duplicate rejected (R-SP-8) |
| RF-08 | Two-system submission | Must | active system resolved; correct strategy used (R-SP-9, R-SP-12) |
| RF-09 | Create-spec input | Must | webview draft/import/attach/submit protocol works |
| RF-10 | Dispatch CR→tasks | Should | builds payload, dispatches (🔴 mock), attaches task links |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | FSM rejects invalid transitions; auto-review has a retry queue | `state.ts:287,552-587` | 🟢 |
| Observabilidade | ~15 telemetry loggers for transitions/dispatch/blockers | `review-flow/telemetry.ts` | 🟢 |
| Persistência | State load-on-first-access + write-after-mutation to JSON | `state.ts:56-123` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um spec em current sem tarefas/checklist pendentes
Quando sendToReview é chamado
Então o spec vai para review e completedAt/reviewEnteredAt são carimbados (R-SP-2, R-SP-3)

Dado um spec em review
Quando um change request é criado
Então o spec volta para reopened e o CR é open com archivalBlocker=true (R-SP-4)

Dado um change request com título duplicado (normalizado) de um CR não-addressed
Quando createChangeRequest é chamado
Então é rejeitado (R-SP-8)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| FSM + gating + CR lifecycle + submission (RF-01–RF-05, RF-07, RF-08) | Must | Core lifecycle |
| Auto-return + dispatch (RF-06, RF-10) | Should | Convenience; dispatch is 🔴 mock |
| Create-spec input (RF-09) | Must | Entry point for new specs |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `review-flow/state.ts` | `updateSpecStatus` (271), `canSendToReview`/`sendToReview` (887/937), `canArchive`/`archiveSpec` (694/713), CR + auto-return (351/447/477) | 🟢 |
| `review-flow/change-requests-service.ts` | `createChangeRequest` (34) | 🟢 |
| `review-flow/duplicate-guard.ts` | `validateUniqueChangeRequest` (53) | 🟢 |
| `review-flow/tasks-dispatch.ts` | `dispatchToTasksPrompt` (76) | 🔴 mock |
| `spec-manager.ts` | active-system detect, `executeSpecKitCommand` (107), unified listing (399) | 🟢 |
| `spec-submission-strategy.ts` | strategy factory (62) | 🟢 |
| `create-spec-input-controller.ts` | `open` (125) | 🟢 |

> See `questions.md` for the 🔴 `dispatchToTasksPrompt` mock.
