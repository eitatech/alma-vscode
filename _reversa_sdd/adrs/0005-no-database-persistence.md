# ADR-0005: No database — persist via workspaceState, JSON files, and SecretStorage

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
gatomia is an in-editor extension, not a server. It must persist sessions, hooks, review-flow state, and credentials, but adding a database (or even an embedded one) would add deployment weight and break the "just install the extension" model.

## Decision
Use **no database**. Persist via:
- VS Code **`workspaceState`** (`Memento`) — e.g. `gatomia.hooks.configurations`, `gatomia.devin.sessions`, agent-chat manifest.
- **JSON files** under the workspace — e.g. `.vscode/gatomia/spec-review-state.json`; archived transcripts offloaded to **JSONL**.
- **`SecretStorage`** for credentials (Devin API key + metadata under separate keys).

## Evidence
- `inventory.md` §9 "No database detected"; `data-dictionary.md` headers ("no relational database").
- Review-flow state file `review-flow/state.ts:56-123`; transcript archival to JSONL `agent-chat-session-store.ts`.
- `devin/devin-credentials-manager.ts` SecretStorage keys.

## Consequences
- Zero infra; trivial install; state travels with the workspace.
- **Bounded-memory tactics required**: transcript archival (>10k msgs / >2 MB), 100-session retention, 7-day cloud-session cleanup, 100-log / 50-trigger caps.
- No cross-workspace querying; some state is module-singleton in-memory (review-flow), coupling cache and persistence per host.
