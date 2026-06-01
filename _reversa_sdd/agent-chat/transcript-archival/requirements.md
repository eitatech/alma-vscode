# transcript-archival (use-case)

> Use-case under `agent-chat`. Bounds memory: transcript archival, session retention, shutdown flush.
> Source: `agent-chat-session-store.ts`, `vscode-archive-writer.ts`.

## Visão Geral

Keeps the in-memory transcript and the session catalog bounded. When a transcript grows past a size/count threshold, the oldest slice is offloaded to a JSONL archive and dropped from memory. When the session catalog exceeds the retention cap, the oldest sessions are evicted (their worktrees migrated to an orphaned list). On shutdown, non-terminal sessions are stamped atomically. 🟢

## Responsabilidades

- Detect the archival threshold on every `appendMessages`. 🟢
- Offload the oldest 25% of messages to a JSONL archive and set `hasArchive`/`transcriptArchived`. 🟢
- Enforce the 100-session retention cap; migrate evicted worktrees to an orphaned list. 🟢
- Flush all non-terminal ACP sessions to `ended-by-shutdown` in a single atomic update on deactivation. 🟢

## Regras de Negócio

- **R-AC-4** Archive at **>10,000 messages OR >2 MB**: offload oldest **25%** (`Math.floor(len*0.25)`) to JSONL, drop from memory. 🟢 `agent-chat-session-store.ts:95,298`
- **R-AC-5** Retention cap **100 sessions**; evicted sessions' worktrees migrate to the orphaned list. 🟢 `agent-chat-session-store.ts:100,268`
- **R-AC-6** Shutdown stamps non-terminal ACP sessions `ended-by-shutdown` in **one** atomic update. 🟢 `agent-chat-session-store.ts:475`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Threshold-triggered archival | Should | Crossing 10k msgs or 2 MB offloads oldest 25% to JSONL and sets `hasArchive` |
| RF-02 | Idempotent archive append | Should | Archived messages are removed from memory; re-append does not duplicate |
| RF-03 | Retention eviction | Should | The 101st session evicts the oldest; its worktree id moves to the orphaned list |
| RF-04 | Atomic shutdown flush | Must | `flushForDeactivation` stamps all non-terminal ACP sessions once (R-AC-6) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Escalabilidade | Memory is bounded by archival (25% offload) + 100-session cap | `agent-chat-session-store.ts:95,100,298` | 🟢 |
| Confiabilidade | Single-write shutdown stamp avoids partially-flushed state | `agent-chat-session-store.ts:475` | 🟢 |
| Performance | Threshold check on each append is O(1) on cached counters | `agent-chat-session-store.ts:284,298` | 🟡 |

## Critérios de Aceitação

```gherkin
Dado um transcript com 10.000 mensagens
Quando uma nova mensagem é anexada
Então as 2.500 mais antigas (25%) são gravadas em JSONL e removidas da memória, e hasArchive=true

Dado 100 sessões persistidas
Quando uma 101a sessão é criada
Então a sessão mais antiga é removida e seu worktree migra para a lista de órfãos

Dado sessões ACP não-terminais ativas
Quando a extensão é desativada
Então todas são marcadas 'ended-by-shutdown' em uma única atualização atômica
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Atomic shutdown flush (RF-04) | Must | Correctness of session state across restarts |
| Archival (RF-01, RF-02) | Should | Memory safety; degrades gracefully |
| Retention eviction (RF-03) | Should | Bounds catalog size |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-session-store.ts` | `appendMessages` (284), archival (95,298), retention (100,268), `flushForDeactivation` (475) | 🟢 |
| `vscode-archive-writer.ts` | JSONL archive writer | 🟢 |
