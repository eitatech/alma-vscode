# polling-cycle, Design Técnico

> HOW the Devin poller works. Source: `devin-polling-service.ts` (487), `status-mapper.ts` (88), `flowcharts/devin.md` §2–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `DevinPollingService.start` / `stop` | `()` | void | `setInterval` lifecycle |
| `DevinPollingService.pollOnce` | `()` | `Promise<void>` | `:234` |
| `DevinPollingService.pollSession` | `(session)` | `Promise<void>` | `:305` |
| `onStatusChange` / `onBlocked` / `onPrStateChange` | `(handler)` | `Disposable` | `:182/197/212` |
| `resolveSessionStatus` | `(status, statusDetail?)` | `SessionStatus` | `status-mapper.ts:60` |

## Fluxo Principal

1. Interval (~5 s) fires → `pollOnce`. 🟢
2. `active = storage.getActive`; `recentlyCompleted` = terminal + updated <5 min + has PRs (only when grace>0). 🟢
3. If poll-set empty: grace>0 → decrement + notify cycle listeners; grace=0 → stop poller. 🟢
4. Resolve API client (no credentials → log + skip). 🟢
5. If active>0 → reset `graceCyclesRemaining=6`. 🟢
6. For each session, `pollSession`: `client.getSession` → `resolveSessionStatus(status, statusDetail)` → **re-read fresh** session by localId. 🟢
7. If response has PRs → reconcile by URL + `detectPrStateChanges`. 🟢
8. If fresh session already terminal → update **PR data only**, skip status/tasks. 🟢
9. Else update status + `syncTaskStatuses` + `devinUrl`; if status changed → emit `StatusChangeEvent`; if newStatus==BLOCKED and previously not → emit `BlockedSessionEvent`. 🟢
10. Notify cycle listeners. 🟢

## State machines

- **Session status** — `flowcharts/devin.md` §3 (`status-mapper.ts:77` terminal set).
- **Task status** — `flowcharts/devin.md` §4; `syncTaskStatuses` maps session→task; terminal tasks frozen. 🟢

## Fluxos Alternativos

- **No credentials at poll time:** log + skip the cycle. 🟢
- **PR-state change:** handled by `pr-state-task-sync/`. 🟢

## Dependências

- `status-mapper`, `devin-session-storage`, `devin-api-client`, `withRetry`, `RateLimiter`, PR reconciliation. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Fresh re-read by localId before mutation (avoid stale overwrite during async poll) | `flowcharts/devin.md` §2 | 🟢 |
| Grace cycles to catch late PR merges after terminal | `devin-polling-service.ts:70` | 🟢 |

## Estado Interno

`graceCyclesRemaining`, interval handle, previous-status snapshot per session (for blocked-edge detection). 🟢

## Observabilidade

Status/blocked/PR-state/cycle event emitters; `DevinProgressEvent`. 🟢

## Riscos e Lacunas

- 🔴 If `cloud-agents` also polls the same Devin session, both may emit completion / write PRs (see `../questions.md`).
