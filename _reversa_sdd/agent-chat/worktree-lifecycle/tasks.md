# worktree-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] git CLI available; the workspace is a git repository with a resolvable HEAD
- [ ] `WorktreeHandle` type defined (see `../tasks.md` T-01)

## Tarefas

- [ ] T-01, Implement `create` with git/HEAD pre-flight + `git worktree add -b`
  - Origem no legado: `agent-worktree-service.ts:151`
  - Critério de pronto: returns a `WorktreeHandle{status:'created'}` on a dedicated branch at `baseCommitSha`; seeds `.gitignore`
  - Confiança: 🟢

- [ ] T-02, Implement `inspect` (dirty + unpushed detection)
  - Origem no legado: `agent-worktree-service.ts:269`
  - Critério de pronto: reports uncommitted changes and ahead-of-upstream state
  - Confiança: 🟢

- [ ] T-03, Implement guarded `cleanup`
  - Origem no legado: `agent-worktree-service.ts:318,322`
  - Critério de pronto: dirty/unpushed + `!confirmedDestructive` aborts with a warning; otherwise removes worktree and sets `cleaned`/`cleanedAt` (R-AC-9)
  - Confiança: 🟢

- [ ] T-04, Implement status transitions incl. `abandoned`
  - Origem no legado: `flowcharts/agent-chat.md` §5; `agent-worktree-service.ts`
  - Critério de pronto: `created→in-use→cleaned`; out-of-band deletion → `abandoned`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Create produces an isolated branch + handle (RF-01)
- [ ] TT-02, Cleanup with dirty state and no confirmation aborts (R-AC-9)
- [ ] TT-03, Cleanup with `confirmedDestructive` removes the worktree
- [ ] TT-04, Missing directory transitions to `abandoned`

## Ordem Sugerida

1. T-01 (create) → T-02 (inspect) → T-03 (cleanup) → T-04 (status edges).

## Lacunas Pendentes (🔴)

None. 🟡 confirm `git worktree remove` failure handling (locked worktree).
