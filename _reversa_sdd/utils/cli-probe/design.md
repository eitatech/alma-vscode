# cli-probe, Design Técnico

> HOW probing + host/path resolution work. Source: `cli-detector.ts` (188), `platform-utils.ts` (167), `ide-host-detector.ts` (75), `flowcharts/utils.md` §4–§5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `checkCLI` | `(command, timeout)` | `{installed, version?, error?}` | `:73` |
| `getExtendedPath` | `()` | PATH string | `:19` |
| `detectIdeHost` / `isAcpCandidateHost` | host classification | host / bool | `:46/69` |
| `getMcpConfigPath` / `getVSCodeUserDataPath` | path resolution | string | `:108/61` |

## checkCLI (§5)

1. `execAsync` with `getExtendedPath` + timeout. 🟢
2. ok → output parses as JSON with version? → `installed:true, version=json.version`; else `extractVersion` regex → `installed:true`. 🟢
3. error → killed/SIGTERM? → `installed:false, error=timeout`; else `locateCLIExecutable` (which/where): found → `installed:false` + captured version/output; not → `installed:false, error`. 🟢

## getMcpConfigPath (§4)

`getVSCodeUserDataPath` (appName → IDE dir, +WSL/darwin/win) → `profiles/` exists? scan each for `mcp.json`+mtime → newest wins; else `User/mcp.json` (exists? return; else return path anyway for future creation). 🟢

## Host detection

`detectIdeHost` (appName regex rules) → host; `isAcpCandidateHost`: Windsurf/Antigravity + `env.remoteName` falsy. 🟢

## Dependências

- `vscode` (`env`, `version`), `node:child_process`/`os`/`path`/`fs`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Extended-PATH probe + which/where fallback | `cli-detector.ts:73` | 🟢 |
| Multi-fork + WSL data-dir resolution | `platform-utils.ts:108-167` | 🟢 |
| ACP eligibility gated to specific hosts + non-remote | `ide-host-detector.ts:69` | 🟢 (R-HK-9) |

## Estado Interno

None (pure helpers). 🟢

## Observabilidade

Probe results consumed by `services`/`providers` (dependency checker, welcome). 🟡

## Riscos e Lacunas

- 🟡 WSL `%APPDATA%` resolution shells out to `cmd.exe`+`wslpath` — environment-dependent.
