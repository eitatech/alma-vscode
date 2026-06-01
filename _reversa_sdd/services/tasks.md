# services (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `@agentclientprotocol/sdk`, `handlebars`, `gray-matter`
- [ ] `agent-chat/pending-writes-store` + `diff-stats`; `agents` loader/registry/cache
- [ ] `utils` (cli-detector, ide-host-detector, chat-prompt-runner); compiled prompts

## Tarefas

- [ ] T-01, Implement `AcpClient` (spawn + connection + Client handler)
  - Origem no legado: `acp/acp-client.ts:433,453,706,888`
  - Critério de pronto: `ensureStarted` coalesces; `ClientSideConnection` over `ndJsonStream`; session-update dispatch (R-X-5)
  - Confiança: 🟢

- [ ] T-02, Implement `AcpSessionManager` (keys + consent gate)
  - Origem no legado: `acp/acp-session-manager.ts:84,156,201-225,387-398`
  - Critério de pronto: one client per (providerId,cwd); session keys; npx consent (R-X-5)
  - Confiança: 🟢

- [ ] T-03, Implement permission + buffered-write
  - Origem no legado: `acp-client.ts:316,942-960,1510`
  - Critério de pronto: allow/deny/ask + remembered ToolKind; bufferFileWrites → PendingWrite
  - Confiança: 🟢

- [ ] T-04, Implement `ChatRouter` + `ChatDispatcher`
  - Origem no legado: `chat-router.ts:51,71-108`; `chat-dispatcher.ts:38,83,126-138`
  - Critério de pronto: cached routing; `/cmd` rewrite; Copilot fallback; files-param VS Code≥1.95 (R-X-2, R-X-4)
  - Confiança: 🟢

- [ ] T-05, Implement `AcpProviderRegistry` (built-ins + CDN)
  - Origem no legado: `acp/acp-provider-registry.ts:85-95`
  - Critério de pronto: 24 h cache, 3 s timeout; `forHost` lookup
  - Confiança: 🟢

- [ ] T-06, Implement prompts/refinement/docs/deps
  - Origem no legado: `prompt-loader.ts:157`; `refinement-gateway.ts:105`; `document-preview-service.ts:80`; `dependency-checker.ts`
  - Critério de pronto: render-with-validation; doc-type→cmd; artifact load; TTL dep probe
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, ensureStarted coalesces concurrent starts (RF-01)
- [ ] TT-02, bufferFileWrites → PendingWrite, RPC waits (RF-04)
- [ ] TT-03, `/cmd` rewritten for ACP (R-X-4)
- [ ] TT-04, ACP throw → Copilot fallback (RF-06)

## Ordem Sugerida

1. T-01 → T-02 → T-03 (ACP core) → T-04 → T-05 (routing) → T-06 (rest).

## Lacunas Pendentes (🔴)

None. 🟡 ACP model-set is experimental.
