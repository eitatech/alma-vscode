# polling-and-normalization (use-case)

> Use-case under `cloud-agents`. The unified poll loop + terminal-state normalization.
> Source: `agent-polling-service.ts`, `agent-session-storage.ts`, `flowcharts/cloud-agents.md` §2–§3.

## Visão Geral

Periodically polls the active provider for the set of sessions that still need updates (active + grace-period), applies `SessionUpdate`s to storage, normalizes terminal sessions (deriving task/PR state), and emits `onSessionUpdated`/`onSessionCompleted`. Polling backs off and stops after repeated failures, and surfaces credential expiry. 🟢

## Responsabilidades

- Select sessions to poll: all non-read-only on force; else active + grace-period (exclude terminal PRs). 🟢
- Call `provider.pollSessions`, count failures, stop after 3 consecutive. 🟢
- Apply each update: terminal → derive task statuses; else use provided tasks; merge + set timestamps. 🟢
- Normalize terminal sessions (tasks → `SKIPPED`/derived; undefined PR → `merged`/`open`). 🟢
- Fire update/completed events; fire credential-expiry on credential errors. 🟢

## Regras de Negócio

- **R-CD-4** Stop after 3 consecutive failures; fire `onCredentialExpiry` on credential errors. 🟢 `agent-polling-service.ts:50,306`
- **R-CD-5** Grace window: 5 min (known PR) / 1 h (unknown); terminal PRs excluded; terminal sessions update **PR data only**. 🟢 `agent-polling-service.ts:51,217`
- **R-CD-6** Terminal normalization: non-terminal tasks → derived/`SKIPPED`; undefined PR → `merged` if `COMPLETED`, else `open`. 🟢 `agent-polling-service.ts:346`; `agent-session-storage.ts:248`
- **R-CD-8** Read-only sessions (inactive provider) are excluded from polling. 🟢 `agent-polling-service.ts:212`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Session selection | Must | force → all non-read-only; else active + grace (terminal PRs excluded) |
| RF-02 | Poll + backoff | Must | `pollSessions` failures increment counter; ≥3 stops the interval (R-CD-4) |
| RF-03 | Apply updates | Must | Changed sessions merged; `updatedAt`/`completedAt` set |
| RF-04 | Terminal normalization | Must | Terminal sessions derive task + PR states (R-CD-6) |
| RF-05 | Events | Should | `onSessionUpdated` always on change; `onSessionCompleted` when `COMPLETED` |
| RF-06 | Credential expiry | Must | Credential error → `onCredentialExpiry`, polling halts |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | 3-failure stop + credential-expiry prevents infinite failing loops | `agent-polling-service.ts:50,306` | 🟢 |
| Performance | Grace-period filtering bounds the polled set | `agent-polling-service.ts:51,217` | 🟢 |
| Idempotência | Update merge is idempotent (no change → skip) | `flowcharts/cloud-agents.md` §2 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado sessões ativas e uma sessão terminal com PR aberto dentro da janela de graça
Quando o poll roda
Então as ativas e a terminal-em-graça são consultadas, e PRs terminais são excluídos (R-CD-5)

Dado uma sessão que transiciona para COMPLETED com tasks ainda IN_PROGRESS
Quando a atualização é aplicada
Então as tasks não-terminais são derivadas/SKIPPED e completedAt é definido (R-CD-6)

Dado 3 falhas consecutivas de poll
Quando o poll falha de novo
Então o intervalo é interrompido (R-CD-4)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Selection + poll + apply + normalize (RF-01–RF-04, RF-06) | Must | Core status-tracking loop |
| Events (RF-05) | Should | UI/bridge updates; degrade gracefully |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-polling-service.ts` | `pollOnce` (154), `getSessionsToPoll` (217), `applyUpdate` (255), `deriveTerminalTaskStatuses` (346) | 🟢 |
| `agent-session-storage.ts` | `normalizeSession` (248) | 🟢 |
