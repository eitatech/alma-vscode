# autonomous-task-loop, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` registry/store + canonical `AgentChatSession` type
- [ ] `tasks` `NormalizedTask` + `hooks` `TriggerRegistry`
- [ ] 🔴 Resolve the session-shape + completion-detection gap (see `../questions.md`) BEFORE production use

## Tarefas

- [ ] T-01, Implement `startTask` (queued-only spawn + map)
  - Origem no legado: `autonomous-agent-loop.ts:67`
  - Critério de pronto: only from `queued`; returns sessionId; maps session⇄task; sets running (R-OR-3)
  - Confiança: 🟢 (but construct a **canonical** `AgentChatSession`, not the simplified shape)

- [ ] T-02, Implement `completeTask` + hook firing
  - Origem no legado: `autonomous-agent-loop.ts:103,127-138`
  - Critério de pronto: sets terminal; fires `task-completed`/`task-failed` with task JSON (R-OR-4)
  - Confiança: 🟢

- [ ] T-03, Implement `handleRegistryChange` against canonical terminal states
  - Origem no legado: `autonomous-agent-loop.ts:140`
  - Critério de pronto: detect terminal via `TERMINAL_STATES` (`completed/failed/cancelled/ended-by-shutdown`), NOT `"error"`
  - Confiança: 🔴 — requires the gap resolution

## Tarefas de Teste

- [ ] TT-01, startTask only from queued (R-OR-3)
- [ ] TT-02, completeTask fires the correct hook (R-OR-4)
- [ ] TT-03, Terminal sync uses canonical terminal states (post-fix)

## Ordem Sugerida

1. Resolve `../questions.md` → then T-01 (canonical session) → T-02 → T-03.

## Lacunas Pendentes (🔴)

- 🔴 Canonical `AgentChatSession` construction.
- 🔴 Replace `lifecycleState !== "error"` with canonical terminal-state detection.
