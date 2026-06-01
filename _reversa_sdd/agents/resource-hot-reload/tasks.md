# resource-hot-reload, Tarefas de Implementação

## Pré-requisitos

- [ ] A resources directory laid out as `<dir>/{prompts,skills,instructions}/<name>`
- [ ] `vscode.FileSystemWatcher` available

## Tarefas

- [ ] T-01, Implement `ResourceCache.load` (parallel recursive scan)
  - Origem no legado: `resource-cache.ts:43`
  - Critério de pronto: three maps populated in parallel from nested dirs
  - Confiança: 🟢

- [ ] T-02, Implement `get` (O(1) lookup)
  - Origem no legado: `resource-cache.ts:264`
  - Critério de pronto: `get(type, name)` returns cached content or undefined
  - Confiança: 🟢

- [ ] T-03, Implement `FileWatcher` with 500ms debounce
  - Origem no legado: `file-watcher.ts:21,44`
  - Critério de pronto: create/change/delete collected into a pending set, flushed after 500ms
  - Confiança: 🟢

- [ ] T-04, Implement `reload` (per-file update/evict by `<dir>/<type>/<name>`)
  - Origem no legado: `resource-cache.ts:167,216,229`
  - Critério de pronto: existing → update map; missing → delete from map
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Initial load populates all three maps (RF-01)
- [ ] TT-02, A single file change reloads only that entry after 500ms (RF-03)
- [ ] TT-03, A deleted file is evicted (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None. 🟡 confirm rename handling (delete+create).
