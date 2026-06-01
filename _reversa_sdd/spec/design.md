# spec (module), Design Técnico

> Module-level `design.md`. Source: `src/features/spec/`. Confidence: 🟢 unless noted.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `updateSpecStatus` | `(specId, newStatus)` | `Specification \| null` | FSM-validated — `review-flow/state.ts:271` |
| `validateStatusTransition` / `normalizeStatus` | FSM rules | bool / status | `:128/146` |
| `canSendToReview` / `sendToReview` | `(specId)` | blockers / transition | `:887/937` |
| `canArchive` / `archiveSpec` / `unarchiveSpec` | archival | gates / transition | `:694/713/736` |
| `addChangeRequest` / `updateChangeRequestStatus` | CR lifecycle | CR | `:351/395` |
| `attachTasksToChangeRequest` / `updateTaskStatus` | task linkage | — | `:768/824` |
| `shouldReturnToReview` / `returnSpecToReview` | auto-return | bool / transition | `:447/477` |
| `createChangeRequest` | dedupe→add→reopen | CR | `change-requests-service.ts:34` |
| `dispatchToTasksPrompt` | `(payload)` | `TasksPromptResponse` | 🔴 mock — `tasks-dispatch.ts:76` |
| `SpecManager.executeSpecKitCommand` / `getAllSpecsUnified` | SDD ops | — / specs | `spec-manager.ts:107/399` |
| `CreateSpecInputController.open` | open panel | — | `create-spec-input-controller.ts:125` |

## Tipos de domínio (catálogo)

| Tipo | Local | Forma |
|------|-------|-------|
| `Specification` | `review-flow/types.ts:47` | `id`, `title`, `owner`, `status`, `completedAt`, `reviewEnteredAt?`, `archivedAt?`, `links`, `pendingTasks?`, `pendingChecklistItems?`, `changeRequests?`, `watchers?` |
| `ChangeRequest` | `:76` | `id`, `specId`, `title`, `severity`, `status`, `tasks: TaskLink[]`, `sentToTasksAt`, `archivalBlocker?` |
| `TaskLink` | `:66` | `taskId`, `source:'tasksPrompt'`, `status: TaskLinkStatus`, `createdAt` |
| `ReviewTransitionEvent` | `:98` | `eventId`, `specId`, `triggerType: auto\|manual`, `status: succeeded\|failed`, `failureReason?` |
| `SpecStatus` | `:10` | `current\|readyToReview(legacy)\|review\|reopened\|archived` |
| `ChangeRequestStatus` | `:20` | `open\|blocked\|inProgress\|addressed` |
| `TaskLinkStatus` | `:29` | `open\|inProgress\|done` |
| `TasksPromptPayload`/`Response` | `tasks-dispatch.ts` | dispatch contract (🔴 mock producer) |

## Fluxo Principal (visão de módulo)

1. **Create** — `CreateSpecInputController` drives the webview; submit → strategy (OpenSpec/SpecKit) → Copilot Chat. 🟢 (→ `create-spec/`)
2. **FSM** — `updateSpecStatus` validates transitions + normalizes legacy alias. 🟢 (→ `status-fsm/`)
3. **Review gate** — `canSendToReview` accumulates blockers; `sendToReview` transitions. 🟢 (→ `send-to-review-gating/`)
4. **Change requests** — create (dedupe, reopen) → attach tasks (dispatch 🔴 mock) → addressed → auto-return. 🟢/🔴 (→ `change-request-lifecycle/`)
5. **Archive** — `canArchive` (no blockers) → `archiveSpec`. 🟢

## State machines (3)

See `flowcharts/spec.md`:
- **Spec status** (§1): `current → review → {reopened, archived, current}`, `reopened → review`, `archived → reopened`.
- **Change-request status** (§3): `open → {blocked, inProgress} → addressed` (re-opens on reverted task).
- **Task link**: `open → inProgress → done`.

## Dependências

- `utils` (notification, chat-prompt-runner), `hooks` (`TriggerRegistry`), `services` (spec-kit adapter), `constants`. 🟢
- Consumed by `providers/spec-explorer-provider.ts`, `panels`, `commands`, `tasks`. 🟢
- External: `vscode` (`workspace`, `EventEmitter`, webview), `node:fs` (state file), `node:crypto`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| FSM as a validated transition table + legacy alias normalization | `review-flow/state.ts:128-151` | 🟢 (ADR-0010) |
| Two-SDD-system abstraction via adapter + submission strategy | `spec-manager.ts:130`; `spec-submission-strategy.ts` | 🟢 (ADR-0004) |
| Review-flow state as a module-level singleton (Map + EventEmitter) | `state.ts` | 🟡 (global coupling) |
| Archival blockers tied to change-request lifecycle | `state.ts:694-708` | 🟢 |

## Estado Interno

Module-scoped `Map<specId, Specification>` + `EventEmitter`, persisted to `.vscode/gatomia/spec-review-state.json`. 🟢

## Observabilidade

~15 telemetry loggers in `review-flow/telemetry.ts`. 🟢

## Riscos e Lacunas

- 🔴 `dispatchToTasksPrompt` is a mock (latency + 10% random fail + 2 hard-coded tasks). See `questions.md`.
- 🟡 Review-flow state is a module-level singleton — global coupling of persistence + cache per host.
