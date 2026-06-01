# polling-cycle (use-case)

> Use-case under `devin`. The periodic poll loop: status resolution, task sync, blocked + PR-state detection, grace window.
> Source: `devin-polling-service.ts`, `status-mapper.ts`, `flowcharts/devin.md` §2–§4.

## Visão Geral

A `setInterval` poller (~5 s) that polls active + recently-completed sessions, resolves each session's status (statusDetail wins), syncs task statuses, detects `RUNNING→BLOCKED` and PR-state changes, and keeps polling for a grace window after all sessions go terminal (to catch late PR merges). 🟢

## Responsabilidades

- Compute the poll set: active sessions + recently-completed (terminal, updated <5 min, has PRs) when grace > 0. 🟢
- Resolve session status via `resolveSessionStatus(status, statusDetail)`. 🟢
- For non-terminal sessions: update status + sync task statuses + `devinUrl`. 🟢
- For terminal sessions in grace: update **only** PR data. 🟢
- Emit status-change, blocked, PR-state-change, and cycle events. 🟢
- Manage grace cycles (`=6` when active>0) and stop when exhausted. 🟢

## Regras de Negócio

- **R-CD-3** statusDetail overrides base status. 🟢 `status-mapper.ts:48-71`
- **R-CD-4** 5 s default interval (min 3, max 60). 🟢 `config.ts:62-74`
- **R-CD-5** `GRACE_CYCLES_AFTER_TERMINAL=6`; recently-completed = terminal + <5 min + has PRs; terminal re-poll updates PR data only. 🟢 `devin-polling-service.ts:70,291,352`
- `RUNNING→BLOCKED` emits a blocked event (Devin needs user input). 🟢 `devin-polling-service.ts:381`
- Task sync: `SESSION_TO_TASK_STATUS` map; terminal tasks frozen. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Poll-set computation | Must | active + recently-completed (grace>0); empty + grace=0 → stop poller |
| RF-02 | Status resolution | Must | `resolveSessionStatus` applies statusDetail-wins; fallback RUNNING (R-CD-3) |
| RF-03 | Non-terminal update | Must | status + task sync + devinUrl updated; terminal tasks frozen |
| RF-04 | Terminal grace update | Must | terminal session re-poll updates PR data only (R-CD-5) |
| RF-05 | Event emission | Must | status-change, blocked (on RUNNING→BLOCKED), PR-state-change, cycle |
| RF-06 | Grace management | Must | grace=6 while active; decremented when poll-set empty; stop at 0 |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Grace window avoids missing late PR merges after completion | `devin-polling-service.ts:70` | 🟢 |
| Performance | Poll-set limited to active + recent; rate-limited API | `devin-polling-service.ts:291`; `rate-limiter.ts` | 🟢 |
| Confiabilidade | Fresh re-read by localId before mutating (avoids stale overwrite) | `flowcharts/devin.md` §2 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão RUNNING que passa a BLOCKED
Quando o poll a resolve
Então um BlockedSessionEvent é emitido para ação do usuário

Dado todas as sessões terminais
Quando o poll-set fica vazio
Então o poller continua por 6 ciclos de graça e então para (R-CD-5)

Dado uma sessão terminal com PRs dentro da janela de graça
Quando o poll a reavalia
Então apenas os dados de PR são atualizados, não status/tasks (R-CD-5)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Poll-set + status + update + events + grace (RF-01–RF-06) | Must | The status-tracking engine |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `devin-polling-service.ts` | `pollOnce` (234), `pollSession` (305), grace (70,291), terminal-PR-only (352), blocked (381) | 🟢 |
| `status-mapper.ts` | `resolveSessionStatus` (60), `mapDevinApiStatusToSessionStatus` (42) | 🟢 |
