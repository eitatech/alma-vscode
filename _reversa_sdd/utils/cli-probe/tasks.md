# cli-probe, Tarefas de Implementação

## Pré-requisitos

- [ ] `vscode` (`env`, `version`); `node:child_process`/`os`/`path`/`fs`

## Tarefas

- [ ] T-01, Implement `getExtendedPath` + `checkCLI`
  - Origem no legado: `cli-detector.ts:19,73`
  - Critério de pronto: extended PATH; JSON/regex version; timeout + which/where fallback
  - Confiança: 🟢

- [ ] T-02, Implement host detection + ACP eligibility
  - Origem no legado: `ide-host-detector.ts:46,69-74`
  - Critério de pronto: appName classification; Windsurf/Antigravity + non-remote (R-HK-9)
  - Confiança: 🟢

- [ ] T-03, Implement data-dir + mcp.json resolution
  - Origem no legado: `platform-utils.ts:61,108-167`
  - Critério de pronto: multi-fork (+WSL/darwin/win); profile-aware mcp.json
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, CLI outside default PATH detected (RF-01)
- [ ] TT-02, Timeout → installed:false (RF-02)
- [ ] TT-03, Windsurf non-remote → ACP candidate (R-HK-9)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None. 🟡 WSL resolution is environment-dependent.
