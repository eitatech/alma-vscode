# services — Contracts (ACP protocol + registry CDN)

> Optional artifact (`doc_level=completo`). The Agent Client Protocol integration this module implements/consumes.
> Source: `acp/acp-client.ts`, `acp/acp-provider-registry.ts`, `acp/types.ts`. Confidence: 🟢.

## 1. Transport

- The extension acts as the **ACP client**; the agent CLI is the server. 🟢
- Transport: spawn the CLI subprocess; bridge stdio via `Writable/Readable.toWeb` → `ndJsonStream` → `ClientSideConnection` (`@agentclientprotocol/sdk`). 🟢
- `PATH` extended via `getExtendedPath()` before spawn. 🟢

## 2. Client → Agent (outbound calls)

| Call | Purpose | Source |
|------|---------|--------|
| `initialize(PROTOCOL_VERSION)` | handshake; advertise fs capabilities `{readTextFile, writeTextFile}` | `acp-client.ts:628` |
| `newSession({ cwd, mcpServers: [] })` | create a session | `:706` |
| `prompt({ text })` | run a turn; resolves with `stopReason` | `:453` |
| `unstable_setSessionModel(modelId)` | experimental model set; missing → throw `ACP_NOT_SUPPORTED` | `:806` |
| `cancel` / probeModels | turn cancel / model discovery | `acp-client.ts` |

## 3. Agent → Client (the `Client` handler, `buildClientHandler` :888)

| Handler | Behavior |
|---------|----------|
| `sessionUpdate(update)` | routed by kind: `agent_message_chunk` / `agent_thought_chunk` / `user_message_chunk`, `plan`, `available_commands_update`, `current_mode_update` / `session_info_update` / `usage_update`, `tool_call` / `tool_call_update` (extract affected files + diff stats + guess language) |
| `requestPermission(params)` | resolve by mode + remembered `allow_always`/`reject_always` per `ToolKind`; else prompt (see `permission-and-write-approval/`) |
| `readTextFile(path)` | read file content for the agent |
| `writeTextFile(path, content)` | buffered approval when `bufferFileWrites`, else direct write (see `permission-and-write-approval/`) |

## 4. Session keys (`acp-session-manager.ts:387-398`)

| Key form | Meaning |
|----------|---------|
| `_ws_` | workspace-scoped session |
| `spec:<id>` | spec-scoped session |
| `once:<uuid>` | single-shot (deleted after the turn) |

One `AcpClient` subprocess per `(providerId, cwd)` (R-X-5). `npx` spawns gated by a one-time consent per `(providerId, cwd)`. 🟢

## 5. ACP Provider Registry (CDN)

> `acp/acp-provider-registry.ts`. 🟢

- Built-in descriptors (Devin/Gemini CLI probes in `acp/providers/*`) + remote augmentation from the public **ACP Registry CDN** over HTTPS.
- Cache: **24 h** TTL; fetch timeout **3 s**.
- Remote entries are **metadata-only** until a spawn command is provided.
- `forHost(host)` selects eligible descriptors for the detected IDE host.

## 6. Error sentinels

`ACP_NOT_SUPPORTED` (no `unstable_setSessionModel`) → caller downgrades model selection. Startup failures/timeouts reject pending waiters and reset to `idle`. 🟢
