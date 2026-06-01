# panels — Open Questions (🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `code-analysis.md` (panels note), `commands`/extension analysis.

## Q1 🟡 New Session panel may be superseded by the composer

**Observation.** `new-session-panel.ts` ships a **stub HTML** ("React view wired separately"). The real new-session picker appears to live in `agent-chat-view-provider`'s composer (`control/new-session` → `dispatchNewSessionFromComposer`).

**Question.** Is `NewSessionPanel` (`gatomia.agentChat.newSession`) still reachable from a command, or is it dead/legacy in favor of the sidebar composer?

## Q2 🟡 Devin progress panel may be dormant

**Observation.** `devin-progress-panel.ts` + `devin-message-handler.ts` look superseded by the provider-agnostic `CloudAgentProgressPanel` (spec 016). The `cloud-agent` panel "replaces the Devin-specific one."

**Question.** Is `gatomia.devinProgress` still contributed/used, or dead code to remove? (Tied to the broader Devin-vs-cloud ownership question — see `cloud-agents/questions.md` Q1.)

## Q3 🟡 `readTranscript` memento coupling

`AgentChatPanel.readTranscript` reads the store's memento via `transcriptKeyFor(id)` (a tightly-scoped cast) instead of a public store API. Should the store expose a public read so the panel doesn't depend on internal key layout?

---

> These are wiring/dead-code confirmations, not behavioral gaps. The panel behaviors themselves are 🟢. Resolve via `package.json`/`extension.ts` (the `commands` analysis).
