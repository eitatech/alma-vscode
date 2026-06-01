# permission-and-write-approval, Design Técnico

> HOW the two gates work. Source: `acp/acp-client.ts:316,888,942-960,1446,1510`, `flowcharts/services.md` §3–§4.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AcpClient.buildClientHandler` | `()` | SDK `Client` | provides requestPermission/writeTextFile — `:888` |
| `AcpClient.resolvePermission` | `(params)` | `optionId \| null` | `:1510` |
| (handler) `writeTextFile` | `(path, content)` | RPC reply | `:942` |

## Permission resolution (§3)

1. `permissionDefault`: `allow` → pick allow option; `deny` → null/reject. 🟢
2. `ask` → remembered decision for the `ToolKind`?
   - `allow_always` → re-resolve allow `optionId` (ids rotate). 🟢
   - `reject_always` → null. 🟢
   - none → prompter set? no → default deny/cancel; yes → prompt user. 🟢
3. user chose an "always" option → `rememberAlwaysDecision(ToolKind)`; else one-shot. 🟢

## Buffered write (§4)

1. `bufferFileWrites`? no → `fs.writeFile` directly → reply. 🟢
2. yes → read `oldText` best-effort → diff stats → enqueue `PendingWrite` → notify subscribers (webview Accept/Reject bar). 🟢
3. user decision via `flushPendingWrites`: accept → `fs.writeFile` → resolve RPC; reject → reject RPC (agent sees failure). 🟢

## Dependências

- `agent-chat/pending-writes-store` (the buffer), `agent-chat/diff-stats`, `node:fs`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Remembered-permission memo keyed by ToolKind, optionId re-resolved live | `acp-client.ts:1446,1510` | 🟢 |
| Buffered-write approval gate (default-safe) | `acp-client.ts:942` | 🟢 (ADR-0009) |

## Estado Interno

The remembered-decision map (per ToolKind, client lifetime); the pending-writes buffer. 🟢

## Observabilidade

Pending writes surfaced to the webview; rejection propagated to the agent. 🟢

## Riscos e Lacunas

- 🟡 `oldText` is read best-effort; if the file is unreadable, diff stats may be partial.
