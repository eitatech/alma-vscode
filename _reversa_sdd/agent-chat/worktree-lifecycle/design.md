# worktree-lifecycle, Design Técnico

> HOW worktree isolation works. Source: `agent-worktree-service.ts` (389 LOC), `flowcharts/agent-chat.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentWorktreeService.create` | `(input)` | `Promise<WorktreeHandle>` | `git worktree add -b` — `:151` |
| `AgentWorktreeService.inspect` | `(handle)` | `Promise<WorktreeInspection>` | dirty/unpushed report — `:269` |
| `AgentWorktreeService.cleanup` | `(handle, opts: { confirmedDestructive })` | `Promise<void>` | guarded — `:318,322` |

### `WorktreeHandle` (`types.ts:151`)
`{ id: UUIDv4, absolutePath, branchName, baseCommitSha, status: 'created'|'in-use'|'abandoned'|'cleaned', createdAt, cleanedAt? }`

## Fluxo Principal

1. **create** — resolve repo root → verify git is present and HEAD resolves → `git worktree add -b <branch> <path>` at `baseCommitSha` → seed `.gitignore` → return handle `status:'created'`. 🟢 `:151`
2. **attach** — when the session begins using it, status → `in-use`. 🟢
3. **inspect** — run git status/ahead-behind to detect dirty (uncommitted) or unpushed (ahead of upstream) changes. 🟢 `:269`
4. **cleanup** — if dirty/unpushed and `!confirmedDestructive`: warn and abort. Else remove the worktree (`git worktree remove`) and set `status:'cleaned'`, `cleanedAt`. 🟢 `:318,322`
5. **abandoned** — if the directory is gone out-of-band, mark `abandoned`. 🟢

## Fluxos Alternativos

- **Not a git repo / no HEAD:** `create` fails pre-flight; the session falls back or errors (verify caller). 🟡
- **Clean worktree cleanup:** proceeds without confirmation. 🟢

## Dependências

- git CLI (worktree subcommands). 🟢
- `node:fs` for path/seed handling. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Branch-per-session via native `git worktree` (not stashes/patches) | `agent-worktree-service.ts:151` | 🟢 |
| Two-step destructive confirmation flag rather than silent force-remove | `agent-worktree-service.ts:322` | 🟢 |

## Estado Interno

The `WorktreeHandle.status` field is the state. Evicted/abandoned worktrees are tracked by the session store's orphaned list (see `transcript-archival/`). 🟢

## Observabilidade

Worktree create/cleanup and dirty warnings are logged. 🟡

## Riscos e Lacunas

- 🟡 Behavior when `git worktree remove` fails (e.g. locked) is not detailed here — confirm in `agent-worktree-service.ts:318`.
