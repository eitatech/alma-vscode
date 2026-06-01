# ADR-0009: Tool-call permission model + pending file-write approval gate

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Local ACP agents can read/write files and invoke tools with the user's full privileges. Letting an autonomous agent mutate the workspace unsupervised is unacceptable; prompting for every single action is too noisy.

## Decision
Two complementary gates:
1. **Permission model** — `ask | allow | deny` (default `ask`). On `ask`, the user may remember `allow_always` / `reject_always` **per `ToolKind`** for the client's lifetime. Default mode lives in **Global** config (single source of truth, rebroadcast to the webview).
2. **Pending-write gate** — agent `writeTextFile` calls are **buffered** and **block execution** until the user resolves them (`accept-all`/`reject-all`/`accept-one`/`reject-one`), surfaced as a per-file diff bar.

## Evidence
- `services/acp/acp-client.ts:316,942,1510`; `agent-chat/pending-writes-store.ts`.
- `providers/agent-chat-view-provider.ts:534-550` (Global default + rebroadcast).
- `permissions.md` §1–§2; `state-machines.md` §19.

## Consequences
- Users keep meaningful control without per-action fatigue.
- Remembered decisions are **in-memory only** (lost on client dispose); no persisted audit trail (`permissions.md` §10.4).
- Read-only sessions (cloud/terminal) bypass the gates by rejecting input entirely (ADR adjacent: capability gating).
