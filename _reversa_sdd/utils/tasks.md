# utils (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `constants`; `hooks` MCP types; `steering` `ConstitutionManager`; `services` `ChatDispatcher` type
- [ ] `vscode` (`lm`, `env`, `version`), `node:fs`/`path`/`os`/`child_process`

## Tarefas

- [ ] T-01, Implement `SpecSystemAdapter` + spec-kit utilities
  - Origem no legado: `spec-kit-adapter.ts:83,317`; `spec-kit-utilities.ts:80,124`
  - Critério de pronto: pref/auto/QuickPick resolution; paths; numbering; extra discovery (R-SP-9/10)
  - Confiança: 🟢

- [ ] T-02, Implement `parseTasksContent` (dual-format + status)
  - Origem no legado: `task-parser.ts:89,118-168`
  - Critério de pronto: inline + header tasks; acceptance-ratio status; STATUS override
  - Confiança: 🟢

- [ ] T-03, Implement MCP discovery + invoke
  - Origem no legado: `copilot-mcp-utils.ts:87,247,374`
  - Critério de pronto: group by server (heuristics); `invokeTool` (undefined token); graceful empty
  - Confiança: 🟢

- [ ] T-04, Implement platform/host/CLI helpers
  - Origem no legado: `platform-utils.ts:108`; `cli-detector.ts:73`; `ide-host-detector.ts:46,69`
  - Critério de pronto: profile-aware mcp.json (+WSL); extended-PATH probe; ACP eligibility (R-HK-9)
  - Confiança: 🟢

- [ ] T-05, Implement webview builder + chat decorator
  - Origem no legado: `get-webview-content.ts:14`; `chat-prompt-runner.ts:46,75`
  - Critério de pronto: CSP + nonce + escaped attrs (R-X-1); instructions + language + dispatch (R-X-2/3)
  - Confiança: 🟢

- [ ] T-06, Implement parsers + migration + telemetry + config
  - Origem no legado: `checklist-parser.ts`; `yaml-frontmatter-parser.ts`; `spec-kit-migration.ts:185`; `telemetry.ts`; `config-manager.ts`
  - Critério de pronto: frontmatter/checklist; backup-then-migrate; preview p95; in-memory config merge
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Both systems → QuickPick + persist (R-SP-9)
- [ ] TT-02, Task status from acceptance ratio + STATUS override (R-SP... task)
- [ ] TT-03, Missing lm.tools → [] (RF-04)
- [ ] TT-04, Webview HTML has nonce + CSP (R-X-1)

## Ordem Sugerida

1. T-01 → T-02 (spec + tasks) → T-04 (platform) → T-05 (webview/chat) → T-03 (MCP) → T-06 (rest).

## Lacunas Pendentes (🔴)

- 🔴 Decide on improving `correlateToolWithServer` for unconventional tool names (see `questions.md`).
