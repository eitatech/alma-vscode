# agent-chat (module)

> Module-level `requirements.md`. Bounded context: **Conversational Agents**.
> Source: `src/features/agent-chat/` (~5,615 LOC, 16 source files).
> Confidence: 🟢 CONFIRMED from code · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`agent-chat` is the chat-panel runtime for autonomous coding agents. It owns the full lifecycle of an **agent chat session** — local agents driven over the Agent Client Protocol (ACP) and read-only mirrors of cloud agents — including transcript persistence and archival, capability negotiation, git worktree isolation, model discovery, and the pending file-write approval gate. It is the authoritative owner of the `AgentChatSession` aggregate and its FSM. 🟢

## Responsabilidades

- Create and persist agent chat sessions (manifest + transcript) and restore them across extension restarts. 🟢
- Drive an ACP session's event stream and project it into a transcript of typed `ChatMessage`s (`AcpChatRunner`). 🟢
- Enforce the session lifecycle FSM and the at-most-one-queued-follow-up turn discipline. 🟢
- Resolve session **capabilities** (modes/models/thinking levels/agent roles), agent-reported winning over the static catalog. 🟢
- Manage git **worktree** isolation for sessions whose execution target is `worktree`. 🟢
- Buffer agent `writeTextFile` calls as **pending writes** and gate them behind user Accept/Reject. 🟢
- Discover available models per provider with a TTL cache and fallback chain. 🟢
- Archive long transcripts and evict sessions beyond the retention cap; flush non-terminal sessions atomically on shutdown. 🟢
- Expose a webview-facing API surface (consumed by `providers`/`panels`/`webview-agent-chat`). 🟢

## Regras de Negócio

- **R-AC-1** Terminal lifecycle states (`completed`/`failed`/`cancelled`/`ended-by-shutdown`) are **absorbing**; a new run always creates a new session, never reuses a terminal one. 🟢 `types.ts:27,33`; `acp-chat-runner.ts:304`
- **R-AC-2** At most **one** follow-up may be queued while a turn is in flight; a second submit throws. 🟢 `acp-chat-runner.ts:310`
- **R-AC-3** **Cloud sessions are read-only** — follow-up submit and retry are rejected with a fixed reason; terminal sessions also reject input. 🟢 `types.ts:539`; `cloud-chat-adapter.ts`
- **R-AC-4** Transcript is archived when it exceeds **10,000 messages OR 2 MB**: the oldest 25% is offloaded to JSONL and dropped from memory. 🟢 `agent-chat-session-store.ts:95,298`
- **R-AC-5** Retention cap is **100 sessions**; evicted sessions' worktrees migrate to an "orphaned" list for later cleanup. 🟢 `agent-chat-session-store.ts:100,268`
- **R-AC-6** On extension shutdown, non-terminal ACP sessions are stamped `ended-by-shutdown` in a single atomic update. 🟢 `agent-chat-session-store.ts:475`
- **R-AC-7** Capability precedence: **agent-reported capabilities win** over the static catalog. 🟢 `agent-capabilities-service.ts:140`
- **R-AC-8** Mode/model/execution-target changes take effect on the **next turn**, audited via a system message; execution target is immutable once a turn has run. 🟢 `acp-chat-runner.ts:985`
- **R-AC-9** A worktree with dirty or unpushed state can only be cleaned with `confirmedDestructive` (two-step confirmation). 🟢 `agent-worktree-service.ts:322`
- **R-AC-11** Exactly **one** sidebar session binding is alive at a time; the command handler (not the panel) is the single source of truth for panel↔session registration. 🟢 (see `commands`, `providers`)
- Model-discovery cache TTL: **5 min** when resolved, **1 min** when "none". 🟢 `model-discovery-service.ts:37,176`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Create a session with a resolved capability set and an immutable execution target | Must | `createSession` returns an `AgentChatSession` in `initializing`; `executionTarget.kind` ∈ {local, worktree, cloud} |
| RF-02 | Drive an ACP turn end-to-end, projecting events to typed messages | Must | A prompt produces agent/thought/tool/plan messages and a terminal `turn-finished` |
| RF-03 | Enforce at-most-one queued follow-up | Must | A second submit while a turn is in flight throws (R-AC-2) |
| RF-04 | Persist + restore sessions across restarts | Must | After reload, `initialize()` restores manifest entries idempotently |
| RF-05 | Archive transcripts past threshold | Should | Crossing 10k msgs or 2 MB offloads oldest 25% to JSONL, sets `hasArchive` (R-AC-4) |
| RF-06 | Evict beyond retention cap | Should | 101st session evicts oldest; its worktree migrates to orphaned list (R-AC-5) |
| RF-07 | Resolve capabilities agent-wins-over-catalog | Must | `resolve(agentId)` returns merged set with `source` reflecting origin (R-AC-7) |
| RF-08 | Gate agent file writes behind user approval | Must | `writeTextFile` enqueues a `PendingWrite`; agent blocks until Accept/Reject |
| RF-09 | Reject input on read-only/terminal sessions | Must | Cloud or terminal session rejects submit/retry with a fixed reason (R-AC-3) |
| RF-10 | Atomic shutdown flush | Must | `flushForDeactivation` stamps all non-terminal ACP sessions `ended-by-shutdown` once (R-AC-6) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Model discovery coalesces in-flight requests + 5-min TTL cache to avoid repeated probes | `model-discovery-service.ts:37,141,176` | 🟢 |
| Escalabilidade | Bounded memory: transcript archival (25% offload) + 100-session retention cap | `agent-chat-session-store.ts:95,100,298` | 🟢 |
| Confiabilidade | Atomic single-write shutdown stamping prevents partial/zombie sessions | `agent-chat-session-store.ts:475` | 🟢 |
| Segurança | Agent file writes are not applied to disk without explicit user approval | `pending-writes-store.ts:87` | 🟢 |
| Disponibilidade | Model discovery degrades through a fallback chain (Copilot → ACP → catalog → none) | `model-discovery-service.ts:141` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma nova solicitação de chat com capacidade de ACP disponível
Quando o usuário inicia uma sessão e envia um prompt
Então uma AgentChatSession é criada em 'initializing', transiciona para 'running',
  e o transcript recebe a mensagem inicial com deliveryStatus 'delivered'

Dado uma sessão terminal (completed/failed/cancelled/ended-by-shutdown)
Quando o usuário tenta enviar um follow-up
Então o envio é rejeitado e nenhuma nova entrega é criada (R-AC-1, R-AC-3)

Dado um turno em andamento
Quando o usuário envia um follow-up e em seguida envia um segundo
Então o segundo envio lança erro (no máximo um follow-up enfileirado) (R-AC-2)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Session lifecycle FSM + turn loop (RF-01, RF-02, RF-03) | Must | Core runtime; every chat depends on it |
| Persistence + restore (RF-04) | Must | Sessions must survive restarts |
| Pending-write gate (RF-08) | Must | Safety boundary for agent edits |
| Capability resolution (RF-07) | Must | Drives UI affordances and dispatch |
| Archival + retention (RF-05, RF-06) | Should | Bounds memory; has graceful fallback |
| Model discovery cache | Could | Optimization with a "none" fallback |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `acp-chat-runner.ts` | `AcpChatRunner` (event loop, turns) | 🟢 |
| `agent-chat-session-store.ts` | `AgentChatSessionStore` (persistence, archival, retention) | 🟢 |
| `agent-chat-registry.ts` | `AgentChatRegistry` (live index, capacity) | 🟢 |
| `agent-capabilities-service.ts` | `AgentCapabilitiesService` (hybrid resolve) | 🟢 |
| `agent-worktree-service.ts` | `AgentWorktreeService` (worktree lifecycle) | 🟢 |
| `model-discovery-service.ts` | `ModelDiscoveryService` (TTL cache + fallback) | 🟢 |
| `pending-writes-store.ts` | `PendingWritesStore` (write gate) | 🟢 |
| `cloud-chat-adapter.ts` | cloud read-only adapter | 🟢 |
| `types.ts` | session/message/worktree/capability types | 🟢 |
