# polling-and-normalization, Design Técnico

> HOW the poll loop + normalization work. Source: `agent-polling-service.ts` (368), `agent-session-storage.ts`, `flowcharts/cloud-agents.md` §2–§3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentPollingService.pollOnce` | `(force?: boolean)` | `Promise<void>` | `:154` |
| `AgentPollingService.getSessionsToPoll` | `(force)` | `AgentSession[]` | grace filter — `:217` |
| `AgentPollingService.applyUpdate` | `(session, update)` | merged session | `:255` |
| `deriveTerminalTaskStatuses` | `(session)` | `AgentTask[]` | `:346` |
| `AgentSessionStorage.normalizeSession` | `(session)` | normalized | `:248` |

## Fluxo Principal

1. Interval fires (or force refresh) → `pollOnce(force)`. 🟢
2. If no active provider → skip. 🟢
3. **Select**: force → all non-read-only sessions; else active + grace-period (5 min known PR / 1 h unknown; exclude terminal PRs). 🟢 `:217`
4. `provider.pollSessions(selected)`. 🟢
5. **On failure**: `consecutiveFailures++`; credential error → `onCredentialExpiry` (stop); else ≥3 → stop interval; else `onError`. 🟢 `:306`
6. **On success**: reset failures; for each `SessionUpdate` with changes:
   - terminal status → `deriveTerminalTaskStatuses` (derive from session status, else `SKIPPED`); else use provided tasks. 🟢 `:346`
   - merge into storage; set `updatedAt`/`completedAt`. 🟢
   - fire `onSessionUpdated` (→ agent-chat bridge); if `COMPLETED`, fire `onSessionCompleted`. 🟢
7. **normalizeSession** (also at load): terminal → derive tasks + infer PR (`merged` if COMPLETED else `open`) for undefined PR states. 🟢 `:248`

## Fluxos Alternativos

- **No change in an update:** skipped (idempotent). 🟢
- **Terminal session in grace:** only PR data is updated, not status/tasks. 🟢 (R-CD-5)

## Dependências

- `provider.pollSessions` (adapter), `agent-session-storage` (merge/normalize), `EventEmitter`s for updates. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Grace window after terminal to catch late PR merges | `agent-polling-service.ts:51` | 🟢 |
| Normalization applied both on poll and on load (defensive) | `agent-session-storage.ts:248` | 🟢 |
| `SESSION_TO_TASK_STATUS` mapping for terminal task derivation | `flowcharts/cloud-agents.md` §3 | 🟢 |

## Estado Interno

`consecutiveFailures: number`, interval handle, last-poll timestamps per session. 🟢

## Observabilidade

`onError`, `onCredentialExpiry`, `onSessionUpdated`, `onSessionCompleted` events; poll logging. 🟢

## Riscos e Lacunas

- 🟡 Grace constants here vs `devin` module's `GRACE_CYCLES_AFTER_TERMINAL=6` may diverge.
- 🔴 If both this poller and the `devin` poller run for the same Devin session, updates may race (see `../questions.md`).
