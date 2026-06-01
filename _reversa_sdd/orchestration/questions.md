# orchestration — Open Questions (🔴 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `domain.md` §5.2, `traceability/spec-impact-matrix.md` §5, `agent-chat/` types.

## Q1 🔴 Autonomous loop builds a non-canonical `AgentChatSession`

**Observation.** `AutonomousAgentLoopService.startTask` (`autonomous-agent-loop.ts:76-86`) constructs a session object with a **simplified shape** — `{ agentName, messages, systemPrompt, capabilities: {} }`. The canonical `AgentChatSession` (`agent-chat/types.ts:380`) requires `agentId`, `agentDisplayName`, `ResolvedCapabilities`, `executionTarget`, `workspaceUri`, `lifecycleState`, etc.

**Question.** Is the autonomous loop meant to spawn a *real* agent-chat session (constructed via `AgentChatSessionStore.createSession`), or is this a placeholder shape for the MAESTRO prototype only?

**Risk.** Downstream consumers (the read-model, providers, panels) expect the canonical shape; the simplified object will not project correctly and may break `agent-chat` integrations.

## Q2 🔴 Completion detection checks a non-existent state

**Observation.** `handleRegistryChange` (`:140`) treats any mapped recent session as terminal and checks `lifecycleState !== "error"`. But `"error"` is **not** a valid `SessionLifecycleState` — the terminal set is `completed | failed | cancelled | ended-by-shutdown` (`agent-chat/types.ts:33`). A code comment admits *"assuming … means done for now"*.

**Question.** What is the intended success/failure criterion for an autonomously-run task? Should it map `completed → success`, `{failed, cancelled, ended-by-shutdown} → failure`?

**Recommendation (to confirm).** Replace the `!== "error"` check with `TERMINAL_STATES` membership + `state === 'completed'` for success.

## Q3 🟡 Concurrency cap for parallelizable tasks

`claimTask` allows multiple `parallelizable` tasks to run with no observed max-concurrency cap. Is an upper bound intended (to avoid spawning unbounded agent sessions)?

---

> The read-model (`aggregate-snapshot`) is solid and 🟢. The autonomous loop (`autonomous-task-loop`) is 🟡 prototype with the two 🔴 items above — do **not** treat its terminal-sync behavior as a stable contract until Q1/Q2 are answered.
