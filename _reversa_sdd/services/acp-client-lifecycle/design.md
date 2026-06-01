# acp-client-lifecycle, Design Técnico

> HOW the ACP client runs. Source: `acp/acp-client.ts` (1582), `acp/acp-session-manager.ts` (398), `flowcharts/services.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AcpClient.ensureStarted` / `start` | `()` | `Promise<void>` | `:433/555` |
| `AcpClient.sendPrompt` | `(sessionKey, prompt)` | `Promise<void>` | `:453` |
| `AcpClient.createSession` | `()` | session | `:706` |
| `AcpClient.dispatchSessionUpdate` | `(update)` | void | `:1051` |
| `AcpSessionManager.send` | `(...)` | `Promise<void>` | consent → ensureClient → send — `:156` |

## State machine (§1)

`idle → starting` (`ensureStarted`, no connection) → `connected` (spawn CLI → `ndJsonStream` → `ClientSideConnection.initialize(PROTOCOL_VERSION)`); `starting → idle` on init fail/timeout (kill child); `connected → idle` on child exit/error (reject waiters, clear sessions); `connected → [*]` on `dispose`. 🟢

## sendPrompt + dispatch (§2)

1. `ensureStarted`. 🟢
2. session exists? no → `createSession` (`newSession({cwd, mcpServers:[]})`) → capture model state → emit `session-models-changed`; yes → reuse. 🟢
3. `connection.prompt({text})` → await turn → `stopReason`. 🟢
4. key starts with `once:`? → delete single-shot session. 🟢
5. `Client.sessionUpdate` → `dispatchSessionUpdate`: route by kind (agent/thought/user chunk; plan; available_commands; mode/session_info/usage; tool_call/update → extract affected files + diff stats + guess lang). 🟢

## Algorithms

- **stdio JSON-RPC bridge** — `spawn` CLI → `Writable/Readable.toWeb` → `ndJsonStream` → `ClientSideConnection`; `PATH` extended via `getExtendedPath()`. 🟢
- **Startup-timeout race** — `withStartupTimeout` registers a reject-waiter. 🟢

## Dependências

- `@agentclientprotocol/sdk` (`ClientSideConnection`, `ndJsonStream`), `node:child_process`/`stream`, `utils` (cli-detector, ide-host). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Shared start promise to coalesce concurrent starts | `acp-client.ts:433` | 🟢 |
| Session keys encode scope (`_ws_`/`spec:`/`once:`) | `acp-session-manager.ts:387-398` | 🟢 |

## Estado Interno

connection, sessions map, model state, shared start promise, pending-waiter set. 🟢

## Observabilidade

Per-session event bus (chunks/plan/tool-call/meta). 🟢

## Riscos e Lacunas

- 🟡 `mcpServers:[]` is passed empty at session creation — MCP-over-ACP is not wired here.
