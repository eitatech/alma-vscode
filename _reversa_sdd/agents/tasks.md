# agents (module), Tarefas de Implementação

## Pré-requisitos

- [ ] VS Code GitHub Copilot Chat API available (else skip registration gracefully)
- [ ] `gray-matter` available for frontmatter parsing
- [ ] An agents directory containing `.agent.md` files; a resources directory for prompts/skills/instructions

## Tarefas

- [ ] T-01, Define `types.ts` (definitions, commands, resources, errors)
  - Origem no legado: `src/features/agents/types.ts:14,46,63,101,135,149,244,255`
  - Critério de pronto: all types in the data-dictionary compile (`AgentDefinition`, `AgentCommand`, `AgentResources`, `ToolExecutionContext`, `ToolResponse`, error classes, `ValidationResult`)
  - Confiança: 🟢

- [ ] T-02, Implement `AgentLoader` (discover + parse + validate + `/help` inject)
  - Origem no legado: `agent-loader.ts:26,143,165,243,262`
  - Critério de pronto: recursive `.agent.md` scan; frontmatter parse; kebab-case id + ≥1 command validation; `/help` auto-injected (R-AC-10)
  - Confiança: 🟢

- [ ] T-03, Implement `ToolRegistry` (register/execute, unique names, timing)
  - Origem no legado: `tool-registry.ts:25,38,40,47,67`
  - Critério de pronto: `^[a-z0-9.-]+$` name check; duplicate registration throws; execute validates params, runs with timing, wraps errors
  - Confiança: 🟢

- [ ] T-04, Implement `ResourceCache` + `FileWatcher` (parallel load, hot-reload)
  - Origem no legado: `resource-cache.ts:43,167,216,229,264`; `file-watcher.ts:21,44`
  - Critério de pronto: parallel load of three resource types; 500ms-debounced incremental reload; deleted files evicted
  - Confiança: 🟢

- [ ] T-05, Implement `ChatParticipantRegistry` (register + route requests)
  - Origem no legado: `chat-participant-registry.ts:71,147`
  - Critério de pronto: each valid agent registered with icon + followups; `@agent /cmd` routed to the bound tool
  - Confiança: 🟢

- [ ] T-06, Implement `error-formatter` (categorize, sanitize, guidance)
  - Origem no legado: `error-formatter.ts:12,49,270,294`
  - Critério de pronto: 6 categories; paths stripped + 200-char cap; severity log + telemetry
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Invalid id (non kebab-case) fails validation and is skipped (R-AC-10)
- [ ] TT-02, `/help` auto-injection when absent (R-AC-10)
- [ ] TT-03, Duplicate tool name registration throws (R-AC-10)
- [ ] TT-04, Resource hot-reload updates/evicts only affected entries after 500ms

## Ordem Sugerida

1. T-01 (types) → T-02 (loader) → T-03 (tools).
2. T-04 (resources) → T-05 (registry) → T-06 (errors).

## Lacunas Pendentes (🔴)

None. 🟡 confirm `AgentCommand.parameters` string-vs-array interpretation.
