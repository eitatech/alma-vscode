# transcript-archival, Design Técnico

> HOW archival/retention/flush work. Source: `agent-chat-session-store.ts` (812 LOC), `vscode-archive-writer.ts`.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `AgentChatSessionStore.appendMessages` | `(sessionId, messages)` | `Promise<void>` | Entry point; checks threshold — `:284` |
| `AgentChatSessionStore.flushForDeactivation` | `()` | `Promise<void>` | Atomic shutdown stamp — `:475` |
| `VscodeArchiveWriter.append` | `(sessionId, slice)` | `Promise<void>` | Writes JSONL archive lines |

## Fluxo Principal

1. `appendMessages` writes to the in-memory transcript and persists the live transcript JSONL. 🟢 `:284`
2. After append, evaluate the threshold: `messageCount > 10_000 || byteSize > 2_000_000`. 🟢 `:95,298`
3. If crossed: compute pivot `Math.floor(len * 0.25)`; take the oldest slice. 🟢 `:298`
4. Append the slice to the archive JSONL via `vscode-archive-writer`; drop those messages from memory; set `hasArchive`/`transcriptArchived`. 🟢
5. On `createSession`, if the catalog size would exceed **100**, evict the oldest session and migrate its worktree id to the orphaned list. 🟢 `:100,268`
6. On `flushForDeactivation`, collect all non-terminal ACP sessions, stamp `lifecycleState='ended-by-shutdown'` + `endedAt`, and persist in a single manifest write. 🟢 `:475`

## Fluxos Alternativos

- **No worktree on an evicted session:** eviction proceeds with no orphan migration. 🟢
- **Archive write failure:** 🟡 archival is best-effort; the in-memory transcript is only dropped after a successful archive append (verify ordering in `:298`).

## Dependências

- `vscode-archive-writer.ts` — JSONL persistence. 🟢
- VS Code storage path under `.vscode/gatomia/`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Dual threshold (count **or** size), oldest-25% pivot | `agent-chat-session-store.ts:95,298` | 🟢 |
| Orphaned-worktree list instead of synchronous cleanup on eviction | `agent-chat-session-store.ts:268` | 🟢 |
| Single atomic manifest write on shutdown | `agent-chat-session-store.ts:475` | 🟢 |

## Estado Interno

Per-session: `messageCount`, byte accumulator, `hasArchive`/`transcriptArchived`. Catalog: ordered manifest entries; an `orphanedWorktrees` list. 🟢

## Observabilidade

Archival and eviction events logged. 🟡 exact names in `telemetry.ts`.

## Riscos e Lacunas

- 🟡 Exact byte-size accounting (serialized length vs UTF-8 bytes) — confirm in `agent-chat-session-store.ts:298`.
