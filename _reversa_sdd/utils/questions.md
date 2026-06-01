# utils — Open Questions (🔴 / 🟡 for human validation)


> ✅ **RESOLVED 2026-05-29 (Reviewer).** Every open question in this file was answered by the maintainer in chat. See top-level `_reversa_sdd/questions.md` and `confidence-report.md` for the decisions and reclassifications.

> Cross-reference: `code-analysis.md` (utils note), `architecture.md` §2 (blast radius).

## Q1 🔴 Heuristic MCP tool→server correlation

**Observation.** `correlateToolWithServer` (`copilot-mcp-utils.ts:374`) uses layered heuristics (built-in prefixes → configured-id substring/path/hyphen match → `mcp_<id>_` prefix → `other-tools` fallback). Tools whose names don't encode their server land in `other-tools`.

**Question.** Is there a reliable server-of-origin signal from `vscode.lm.tools` (e.g. a metadata field) that should be used instead of name heuristics? If not, is the `other-tools` bucket acceptable for unconventional names?

**Why it matters.** Hook MCP actions pick tools by server grouping; imperfect grouping can misattribute or hide tools.

## Q2 🟡 `ConfigManager` persistence

`ConfigManager.loadSettings`/`saveSettings` mutate **in-memory** state only; `vscode.workspace.getConfiguration` is the real source of truth. `saveSettings` looks like a partial/legacy persistence path.

**Question.** Should `saveSettings` write through to VS Code configuration, or is the in-memory merge intentional (config is read fresh each time)?

## Q3 🟡 Preview telemetry scope

`utils/telemetry.ts` is preview-scoped and in-memory only (capped 1000/type), separate from per-feature telemetry sinks; no external pipeline is wired. Confirm whether an external telemetry export is intended.

---

> The spec adapter, task parser, CLI/host helpers, webview builder, and chat decorator are 🟢 and faithful. Only MCP correlation (Q1) is a known heuristic limitation.
