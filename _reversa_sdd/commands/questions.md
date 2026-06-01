# commands — Open Questions + Resolutions


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `providers/questions.md`, `panels/questions.md`, `code-analysis.md` (commands note).

## Resolutions (gaps this module closes)

- 🟢 **panels Q1 resolved:** `gatomia.agentChat.newSession` is the **QuickPick** (`agent-chat-new-session.ts`), not the `NewSessionPanel` stub → the stub panel is **dormant** on the active path.
- 🟢 **R-AC-11 confirmed:** `attachPanel` is called **only** in `handleStartNew` — the command handler is the single source of truth for panel↔session registration.

## Q1 🔴 `package.json` command + menu contributions

**Observation.** The handler logic and command ids live here, but `contributes.commands`, `contributes.menus` (`view/item/context`, command palette `when` clauses), and command icons live in `package.json` (outside this folder).

**Question.** Which `gatomia.*` ids are contributed, with which `when` clauses / menu locations / icons? Which are palette-only vs tree-context? (Needed to know the real UX surface.)

**Resolution path.** Confirm against `package.json` + `extension.ts` registration (the extension entry calls `register*Commands(deps)`).

## Q2 🟡 Devin command family vs cloud-agents

The legacy `DEVIN_COMMANDS` family coexists with `CLOUD_AGENT_COMMANDS`. Whether the Devin-specific commands are still contributed/used ties to the broader Devin-vs-cloud ownership question (`cloud-agents/questions.md` Q1, `devin/questions.md` Q1).

---

> Handler behaviors are 🟢 and faithful. The only true gap is the **contribution wiring** (Q1), resolvable from `package.json`/`extension.ts`.
