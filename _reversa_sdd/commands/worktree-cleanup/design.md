# worktree-cleanup, Design Técnico

> HOW two-step cleanup works. Source: `agent-chat-commands.ts:358-450`, `flowcharts/commands.md` §4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `handleCleanupWorktree` | `(sessionId, confirmedDestructive, deps)` | result | `:409` |
| `handleCleanupOrphanedWorktree` | `(orphanRef, confirmedDestructive, deps)` | result | `:358` |

## Fluxo Principal (§4)

1. `worktreeService?` no → error "not configured". 🟢
2. resolve session + worktree; no worktree → error. 🟢
3. `worktreeService.cleanup(worktree, confirmedDestructive)`:
   - ok → `store.updateSession(worktree.status='cleaned')` → result `ok`. 🟢
   - `WorktreeCleanupWarningRequired` → result `warning{inspection}` → UI shows the 2-step dialog → re-invoke with `confirmedDestructive=true`. 🟢
   - other err → result `error{message}`. 🟢

## Dependências

- `agent-chat` (`AgentWorktreeService` + `WorktreeCleanupWarningRequired`, store). 🟢 (the actual cleanup logic + dirty-check lives in `agent-chat/worktree-lifecycle`).

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Warning-then-confirm via a typed exception re-thrown as a result | `agent-chat-commands.ts:447-450` | 🟢 (R-AC-9) |

## Estado Interno

None (DI handler). 🟢

## Observabilidade

Result kind (`ok`/`warning`/`error`) returned to the UI. 🟡

## Riscos e Lacunas

None. 🟢
