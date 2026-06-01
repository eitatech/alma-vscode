# hooks (module), Tarefas de Implementação

## Pré-requisitos

- [ ] VS Code `workspaceState`, `FileSystemWatcher`, `LanguageModel` API, Git extension API
- [ ] `agents` agent definitions + `services` ACP client available
- [ ] `node:child_process` for ACP subprocess; GitHub MCP server reachable

## Tarefas

- [ ] T-01, Define `types.ts` (Hook, normalized model, action params, enums, constants)
  - Origem no legado: `types.ts:16,54,139,472,515,556-583`
  - Critério de pronto: all data-dictionary types + the 14 constants compile
  - Confiança: 🟢

- [ ] T-02, Implement `HookManager` (CRUD + validation + persistence)
  - Origem no legado: `hook-manager.ts:132,194,254,500,697-715`
  - Critério de pronto: validates sync + async (MCP/agent); immutable fields rejected; persists + emits (R-HK-8)
  - Confiança: 🟢

- [ ] T-03, Implement `TriggerRegistry` + `CommandCompletionDetector`
  - Origem no legado: `trigger-registry.ts:57`; `command-completion-detector.ts:27-72,92`
  - Critério de pronto: watcher patterns + parse-validate + 2 s debounce fire triggers; history FIFO 50 (R-HK-7)
  - Confiança: 🟢

- [ ] T-04, Implement the 6 action executors
  - Origem no legado: `actions/{agent,git,github,mcp,custom,acp}-action.ts`
  - Critério de pronto: each action type dispatches with its validation + result type; ACP lifecycle states (R-HK-... )
  - Confiança: 🟢

- [ ] T-05, Implement MCP discovery/client/pool
  - Origem no legado: `services/mcp-{discovery,client,execution-pool,parameter-resolver}.ts`
  - Critério de pronto: 5-min TTL discovery; concurrency 5; timeout clamp 1 s–5 min (R-HK-6)
  - Confiança: 🟢

- [ ] T-06, Implement template parser + variable catalog
  - Origem no legado: `template-variable-parser.ts:181,212,242`; `template-variable-constants.ts`
  - Critério de pronto: `$var` extract/substitute; missing → empty; 7 categories with `availableFor` (R-HK-5)
  - Confiança: 🟢 — ⚠️ `validateVariables` is a stub today (see `questions.md`)

## Tarefas de Teste

- [ ] TT-01, Immutable field update rejected (R-HK-8)
- [ ] TT-02, Trigger matches by agent+op+timing, sorted by createdAt (R-HK-1)
- [ ] TT-03, Missing `$var` resolves to empty string (R-HK-5)
- [ ] TT-04, MCP execution respects concurrency cap 5 (R-HK-6)

## Ordem Sugerida

1. T-01 (types) → T-02 (manager) → T-03 (triggers/detection).
2. T-06 (templates), T-04 (actions), T-05 (MCP).
3. Use-case folders.

## Lacunas Pendentes (🔴)

- 🔴 `validateVariables` stub — decide whether to implement `availableFor` enforcement (see `questions.md`).
