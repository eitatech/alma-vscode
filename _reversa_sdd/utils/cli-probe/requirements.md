# cli-probe (use-case)

> Use-case under `utils`. CLI install/version probing with an extended PATH.
> Source: `cli-detector.ts`, `platform-utils.ts`, `ide-host-detector.ts`, `flowcharts/utils.md` §5.

## Visão Geral

Probes whether a CLI is installed and its version by running it with an extended PATH (UV/cargo/bun/deno/homebrew) and a timeout; on failure it still `which`/`where`-locates the binary and reports `installed:false`. Supporting helpers detect the IDE host (for ACP eligibility) and resolve the profile-aware `mcp.json` path. 🟢

## Responsabilidades

- `checkCLI`: exec with `getExtendedPath` + timeout → parse version (JSON-first, then regex). 🟢
- On failure: detect timeout (killed/SIGTERM) vs locate via `which`/`where`. 🟢
- `detectIdeHost` / `isAcpCandidateHost`: classify host + ACP eligibility. 🟢
- `getMcpConfigPath` / `getVSCodeUserDataPath`: profile-aware, multi-fork (+WSL). 🟢

## Regras de Negócio

- `checkCLI` runs with extended PATH; on failure `which`/`where`-locates + reports `installed:false` with any captured version. 🟢 `cli-detector.ts:73-188`
- **R-HK-9** ACP eligible only on Windsurf/Antigravity + non-remote (`env.remoteName` falsy). 🟢 `ide-host-detector.ts:69-74`
- `mcp.json`: newest-modified profile wins, else `User/mcp.json` (returned even if absent). 🟢 `platform-utils.ts:108-167`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Version probe | Must | exec extended PATH; JSON-first then regex version |
| RF-02 | Failure handling | Must | timeout → `installed:false`; else locate via which/where |
| RF-03 | Host detection | Must | `detectIdeHost`; `isAcpCandidateHost` (R-HK-9) |
| RF-04 | mcp.json path | Should | profile-aware, multi-fork, +WSL |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Portabilidade | Multi-fork + WSL + darwin/linux/win data-dir branches | `platform-utils.ts:108-167` | 🟢 |
| Robustez | Probe never hangs (timeout) and reports best-effort version | `cli-detector.ts:73` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um CLI instalado fora do PATH padrão
Quando checkCLI roda
Então o extended PATH o encontra e a versão é extraída (RF-01)

Dado o host Windsurf em workspace não-remoto
Quando isAcpCandidateHost é avaliado
Então retorna true (R-HK-9)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Probe + failure + host (RF-01–RF-03) | Must | Dependency detection + ACP routing |
| mcp.json path (RF-04) | Should | MCP config resolution |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `cli-detector.ts` | `checkCLI` (73), `getExtendedPath` (19), `extractVersion`, `locateCLIExecutable` | 🟢 |
| `ide-host-detector.ts` | `detectIdeHost` (46), `isAcpCandidateHost` (69) | 🟢 |
| `platform-utils.ts` | `getMcpConfigPath` (108), `getVSCodeUserDataPath` (61) | 🟢 |
