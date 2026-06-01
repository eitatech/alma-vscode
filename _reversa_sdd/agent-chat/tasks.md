# agent-chat (module), Tarefas de Implementação

> Module-level `tasks.md`. Reimplement the `agent-chat` scaffolding + shared contracts. Use-case behavior is in the nested folders.

## Pré-requisitos

- [ ] `services/acp` event stream available (acp-session-manager, acp-client)
- [ ] VS Code `workspaceState` + a transcript storage directory under `.vscode/gatomia/`
- [ ] `node:crypto.randomUUID` available
- [ ] `cloud-agents` registry/storage present for the cloud read-only adapter

## Tarefas

- [ ] T-01, Define the authoritative type module (`types.ts`)
  - Origem no legado: `src/features/agent-chat/types.ts:18,140,151,235,331,367,380,563,581`
  - Critério de pronto: `AgentChatSession`, `SessionLifecycleState` + `TERMINAL_STATES`, `ChatMessage` union, `ExecutionTarget`, `WorktreeHandle`, `ResolvedCapabilities`, `SessionManifest(Entry)` compile and match the data-dictionary
  - Confiança: 🟢

- [ ] T-02, Implement `AgentChatSessionStore` (persistence + restore)
  - Origem no legado: `src/features/agent-chat/agent-chat-session-store.ts:164,240,284`
  - Critério de pronto: `initialize()` restores manifest idempotently; `createSession` persists a manifest entry; `appendMessages` writes transcript JSONL
  - Confiança: 🟢

- [ ] T-03, Implement `AgentChatRegistry` (live index + capacity)
  - Origem no legado: `src/features/agent-chat/agent-chat-registry.ts:224`
  - Critério de pronto: `checkCapacity(source, cap)` filters non-terminal ACP sessions and sorts waiting-for-input first then oldest `updatedAt`
  - Confiança: 🟢

- [ ] T-04, Implement `AgentCapabilitiesService.resolve` (hybrid, agent-wins)
  - Origem no legado: `src/features/agent-chat/agent-capabilities-service.ts:134,140`
  - Critério de pronto: agent-reported capabilities override the catalog; `source` reflects origin (R-AC-7)
  - Confiança: 🟢

- [ ] T-05, Implement `ModelDiscoveryService` (TTL cache + fallback chain)
  - Origem no legado: `src/features/agent-chat/model-discovery-service.ts:37,141,176`
  - Critério de pronto: Copilot → ACP → catalog → none chain; 5-min TTL (1-min for "none"); in-flight coalescing
  - Confiança: 🟢

- [ ] T-06, Implement the cloud read-only adapter
  - Origem no legado: `src/features/agent-chat/cloud-chat-adapter.ts`; `types.ts:539`
  - Critério de pronto: submit/retry rejected with a fixed reason for cloud sessions (R-AC-3)
  - Confiança: 🟢

- [ ] T-07, Implement `diff-stats.ts` (git-parity line stats)
  - Origem no legado: `src/features/agent-chat/diff-stats.ts`
  - Critério de pronto: `+`/`-` deltas mirror `git diff --shortstat` (moves over-counted, as in git)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Session creation returns `initializing` with an immutable execution target (RF-01)
- [ ] TT-02, Restart restore is idempotent (RF-04)
- [ ] TT-03, Capacity check prioritizes idle (waiting-for-input) sessions for eviction
- [ ] TT-04, Capability resolution: agent-reported wins over catalog (R-AC-7)

## Ordem Sugerida

1. T-01 (types) first — everything depends on it.
2. T-02/T-03 (stores) next.
3. T-04/T-05 (capabilities/models), then T-06/T-07.
4. Use-case folders (`start-and-run-session`, `transcript-archival`, `worktree-lifecycle`) after the scaffolding compiles.

## Lacunas Pendentes (🔴)

None specific to this module. Cross-module: the cloud session shape is reused by `orchestration` (see that module's `autonomous-task-loop` 🔴).
