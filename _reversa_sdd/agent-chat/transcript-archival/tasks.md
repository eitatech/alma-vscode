# transcript-archival, Tarefas de Implementação

## Pré-requisitos

- [ ] `AgentChatSessionStore` + manifest/transcript persistence implemented (see `../tasks.md` T-02)
- [ ] A writable storage directory under `.vscode/gatomia/`

## Tarefas

- [ ] T-01, Implement threshold detection in `appendMessages`
  - Origem no legado: `agent-chat-session-store.ts:284,95,298`
  - Critério de pronto: detects `>10_000` msgs OR `>2 MB`; computes pivot `floor(len*0.25)`
  - Confiança: 🟢

- [ ] T-02, Implement the JSONL archive writer + memory drop
  - Origem no legado: `vscode-archive-writer.ts`; `agent-chat-session-store.ts:298`
  - Critério de pronto: oldest slice appended to archive, removed from memory, `hasArchive=true`
  - Confiança: 🟢

- [ ] T-03, Implement retention eviction + orphaned-worktree migration
  - Origem no legado: `agent-chat-session-store.ts:100,268`
  - Critério de pronto: 101st session evicts oldest; worktree id moves to orphaned list
  - Confiança: 🟢

- [ ] T-04, Implement `flushForDeactivation` (atomic shutdown stamp)
  - Origem no legado: `agent-chat-session-store.ts:475`
  - Critério de pronto: all non-terminal ACP sessions stamped `ended-by-shutdown` in one write (R-AC-6)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Append crossing 10k triggers 25% offload and sets `hasArchive` (R-AC-4)
- [ ] TT-02, Append crossing 2 MB triggers offload (R-AC-4)
- [ ] TT-03, 101st session evicts oldest and migrates worktree (R-AC-5)
- [ ] TT-04, Shutdown flush stamps non-terminal sessions exactly once (R-AC-6)

## Tarefas de Migração de Dados (se aplicável)

- [ ] TM-01, Existing manifests at `schemaVersion:1` load unchanged; archived JSONL files are discovered via `hasArchive`/`transcriptArchived` flags

## Ordem Sugerida

1. T-01/T-02 (archival).
2. T-03 (retention).
3. T-04 (shutdown flush) — independent, can be done in parallel.

## Lacunas Pendentes (🔴)

None. 🟡 confirm byte-size accounting (TT-02) and archive/drop ordering on write failure.
