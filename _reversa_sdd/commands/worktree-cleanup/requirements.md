# worktree-cleanup (use-case)

> Use-case under `commands`. Two-step destructive worktree cleanup command.
> Source: `agent-chat-commands.ts`, `flowcharts/commands.md` §4.

## Visão Geral

Cleans up a session's git worktree via a two-step destructive confirmation: the first pass inspects and, if changes would be lost, returns a `warning` (re-thrown from `WorktreeCleanupWarningRequired`); the UI then re-invokes with `confirmedDestructive=true` to actually remove it. Also covers orphaned-worktree cleanup. 🟢

## Responsabilidades

- Resolve the session + its worktree; error if missing/not configured. 🟢
- Delegate to `worktreeService.cleanup(worktree, confirmedDestructive)`. 🟢
- On `WorktreeCleanupWarningRequired` → return `warning{inspection}` (two-step). 🟢
- On success → `store.updateSession(worktree.status = cleaned)`. 🟢

## Regras de Negócio

- **R-AC-9** First pass `confirmedDestructive:false` → inspect → clean or `warning`; UI re-invokes `confirmedDestructive:true` → remove. 🟢 `agent-chat-commands.ts:447-450`
- Worktree service missing → error "not configured". 🟢 `flowcharts/commands.md` §4
- No worktree on the session → error. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Preconditions | Must | no service → error; no worktree → error |
| RF-02 | Two-step destructive | Must | dirty + not confirmed → `warning{inspection}`; confirmed → remove (R-AC-9) |
| RF-03 | Success update | Must | removal → `worktree.status = cleaned` persisted |
| RF-04 | Orphaned cleanup | Should | `cleanupOrphanedWorktree` handled analogously |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | No destructive removal of dirty/unpushed state without explicit confirm | `agent-chat-commands.ts:447-450` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um worktree sujo
Quando cleanupWorktree(confirmedDestructive=false)
Então retorna warning com a inspeção (R-AC-9)

Dado a re-invocação com confirmedDestructive=true
Quando cleanupWorktree roda
Então o worktree é removido e o status vira cleaned (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Preconditions + two-step + update (RF-01–RF-03) | Must | Safe destructive op |
| Orphaned (RF-04) | Should | Housekeeping |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-commands.ts` | `handleCleanupWorktree` (409,447-450), `handleCleanupOrphanedWorktree` (358) | 🟢 |
