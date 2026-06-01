# resource-hot-reload, Design Técnico

> HOW caching + hot-reload work. Source: `resource-cache.ts` (308), `file-watcher.ts` (104), `flowcharts/agents.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `ResourceCache.load` | `(resourcesDir)` | `Promise<void>` | parallel scan — `:43` |
| `ResourceCache.reload` | `(changedPaths)` | `Promise<void>` | per-file update/delete — `:167` |
| `ResourceCache.get` | `(type, name)` | `string \| undefined` | O(1) Map lookup — `:264` |
| `FileWatcher.onFileChange` | `(uri)` | adds to pending set | `:44` |

## Fluxo Principal

1. `load(dir)` recursively scans `prompts/`, `skills/`, `instructions/` in parallel and fills three `Map<string,string>`. 🟢 `:43`
2. `FileWatcher` subscribes to create/change/delete on the resources dir; each event adds the path to a pending set. 🟢 `file-watcher.ts:44`
3. After **500ms** of quiescence the watcher flushes `flushPendingChanges()` → `reload(changedPaths)`. 🟢 `file-watcher.ts:21`
4. `reload` derives `(type, name)` from `<dir>/<type>/<name>`; for each path: file exists → read + update map; missing → delete from map. 🟢 `:167,216,229`

## State machine (resource cache)

`empty → loaded` (load) `→ pending-reload` (watcher event) `→ reloading` (debounce flush) `→ loaded`. See `flowcharts/agents.md` §2. 🟢

## Fluxos Alternativos

- **Path outside the `<dir>/<type>/<name>` shape:** ignored (not a known resource). 🟡
- **Rapid successive edits:** coalesced by the debounce into one reload batch. 🟢

## Dependências

- External: `vscode.FileSystemWatcher`, `workspace.fs`, `node:path`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Three separate maps keyed by name (not a single nested map) | `resource-cache.ts` | 🟢 |
| Debounced batch reload rather than per-event reload | `file-watcher.ts:21` | 🟢 |

## Estado Interno

Three `Map<string,string>` (prompts/skills/instructions) + a `Set<string>` pending-changes buffer + a debounce timer. 🟢

## Observabilidade

Reload events logged. 🟡

## Riscos e Lacunas

- 🟡 Behavior on a rename (delete+create pair) relies on the watcher emitting both events.
