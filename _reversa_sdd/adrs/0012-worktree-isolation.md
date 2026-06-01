# ADR-0012: Git worktree isolation per agent session

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
An autonomous agent editing files directly on the user's working branch is risky — it can clobber uncommitted work and mix agent edits with human edits. Sessions need an isolated place to work that can be reviewed and discarded.

## Decision
Offer a **`worktree` execution target**: create a git worktree on a dedicated branch (`git worktree add -b`, seed `.gitignore`), bind it to the session, and tear it down on cleanup. One ACP subprocess runs per `(providerId, cwd)`, so a worktree is its own isolated agent runtime. Cleanup of a dirty/unpushed worktree requires a **two-step destructive confirmation** (`confirmedDestructive`). Evicted/abandoned worktrees migrate to an **orphaned list** for later cleanup.

## Evidence
- `agent-chat/agent-worktree-service.ts` (create/inspect/cleanup), `WorktreeHandle` FSM (`state-machines.md` §4).
- Rules R-AC-5, R-AC-9; commands two-step destructive flow `agent-chat-commands.ts:409-450`.

## Consequences
- Agent edits are isolated, reviewable, and safely discardable.
- Adds worktree lifecycle bookkeeping and orphan-cleanup machinery.
- Execution target is **immutable after the first turn** to keep the worktree↔session binding coherent (R-AC-8).
