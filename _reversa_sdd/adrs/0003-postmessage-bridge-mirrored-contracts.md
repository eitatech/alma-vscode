# ADR-0003: postMessage bridge as the sole host↔webview contract

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Because the extension and webview are built separately (ADR-0002) and run in different processes/sandboxes, they cannot share code or types at the module level. They still need a rich, evolving protocol (sessions, transcripts, hooks, specs, previews).

## Decision
All host↔webview communication goes through the VS Code **`postMessage`** API. Each surface defines a **discriminated-union message protocol** (`type` discriminator, e.g. `agent-chat/*`, `hooks/*`, `preview/*`). Webview type files are **hand-maintained mirrors** of the extension contracts; the webview **must not import from `src/`**. Where both a `type` and legacy `command` key exist, readers accept `type ?? command` (dual-keyed protocol).

## Evidence
- `bridge/vscode.ts` (`acquireVsCodeApi` once + dev echo fallback).
- Every webview module declares `*ExtensionMessage`/`*WebviewMessage` unions (data-dictionary.md).
- Explicit rule `webview-agent-chat/types.ts:11` "MUST NOT import from `src/`"; parity tests guard `requirements.ts` drift.

## Consequences
- Clean process isolation; webview is testable in isolation.
- **Type drift risk**: mirrors can diverge from the source of truth. Two known violations: `webview-spec-explorer` imports from `src/` and uses a separate `acquireVsCodeApi` instance (`window.specExplorerVscode`) — flagged as 🔴 in `domain.md` §5.6.
- Buffering complexity: panels queue messages until a `*/ready` handshake.
