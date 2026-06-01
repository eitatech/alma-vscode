# ADR-0006: Adopt the Agent Client Protocol (ACP) for local CLI agents

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Beyond GitHub Copilot Chat, users want to run **local agent CLIs** (Devin CLI, Gemini CLI) directly in the editor. These tools expose a JSON-RPC interface over stdio. A bespoke integration per CLI would not scale.

## Decision
Integrate local agents through the **Agent Client Protocol** (`@agentclientprotocol/sdk`). The `AcpClient` spawns the provider CLI as a subprocess, drives a `ClientSideConnection` over an ndjson stdio stream, and implements the client handler (`sessionUpdate`, `requestPermission`, `readTextFile`, `writeTextFile`). One client per `(providerId, cwd)`. A `ChatRouter` decides ACP vs Copilot per request.

## Evidence
- `services/acp/acp-client.ts` (1582 LOC), `acp-session-manager.ts`, `acp-provider-registry.ts` (built-ins + remote CDN registry, 24 h cache).
- Routing rules: `chat-router.ts` (config override → remote off → host probe); ACP only on Windsurf/Antigravity + non-remote (R-HK-9 / R-X-4/5).

## Consequences
- New local agents can be added as descriptors (built-in, workspace, or remote-registry) without bespoke code.
- Adds subprocess lifecycle complexity (startup-timeout race, process-exit cleanup) and a per-`(providerId,cwd)` `npx` consent gate.
- Relies on **experimental** ACP APIs (`unstable_setSessionModel`) with `ACP_NOT_SUPPORTED` fallbacks.
