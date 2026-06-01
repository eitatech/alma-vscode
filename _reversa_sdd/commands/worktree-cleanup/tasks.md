# worktree-cleanup, Tarefas de Implementação

## Pré-requisitos

- [ ] `agent-chat` `AgentWorktreeService` + `WorktreeCleanupWarningRequired` + store

## Tarefas

- [ ] T-01, Implement preconditions + cleanup delegation
  - Origem no legado: `agent-chat-commands.ts:409`
  - Critério de pronto: no service/worktree → error; else `worktreeService.cleanup`
  - Confiança: 🟢

- [ ] T-02, Implement two-step warning handling + status update
  - Origem no legado: `agent-chat-commands.ts:447-450`
  - Critério de pronto: `WorktreeCleanupWarningRequired` → warning; confirmed → remove → status cleaned (R-AC-9)
  - Confiança: 🟢

- [ ] T-03, Implement orphaned cleanup
  - Origem no legado: `agent-chat-commands.ts:358`
  - Critério de pronto: analogous two-step for orphaned worktrees
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Dirty + not confirmed → warning (R-AC-9)
- [ ] TT-02, Confirmed → removed + status cleaned (RF-03)
- [ ] TT-03, No worktree → error (RF-01)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
