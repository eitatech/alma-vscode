# mcp-discovery (use-case)

> Use-case under `utils`. Discover MCP servers/tools via `vscode.lm` and invoke them.
> Source: `copilot-mcp-utils.ts`, `flowcharts/utils.md` §3.

## Visão Geral

Discovers MCP tools from `vscode.lm.tools`, correlates each to a server via layered heuristics, groups them into `MCPServer[]`, and invokes a tool via `lm.invokeTool`. Degrades gracefully when the LM API is unavailable. 🟢

## Responsabilidades

- `queryMCPServers`: if `lm.tools` available, load `mcp.json`, correlate each tool to a server, group. 🟢
- `correlateToolWithServer`: built-in → vscode-tools; configured id match → serverId; `mcp_<id>_` prefix → extracted; else other-tools. 🟢
- `executeMCPTool`: `lm.invokeTool(name, {input}, token)` with `toolInvocationToken: undefined`. 🟢

## Regras de Negócio

- Missing `vscode.lm`/`lm.tools` → `[]` (never throws on availability). 🟢 `copilot-mcp-utils.ts:90-98`
- Unmatched tools → `other-tools`. 🟢 `copilot-mcp-utils.ts:403-404`
- `executeMCPTool` uses `toolInvocationToken: undefined` (outside a chat request). 🟢 `copilot-mcp-utils.ts:262-269`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Availability guard | Must | no `lm.tools` → `[]` |
| RF-02 | Correlation | Should | built-in/config-match/`mcp_` prefix/other-tools heuristics |
| RF-03 | Grouping | Should | tools grouped into `MCPServer[]` with formatted names |
| RF-04 | Invoke | Should | `lm.invokeTool` with undefined token |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Discovery never throws on missing API | `copilot-mcp-utils.ts:90` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado vscode.lm.tools indisponível
Quando queryMCPServers roda
Então retorna [] sem lançar (RF-01)

Dado um tool "mcp_github_create_issue"
Quando correlacionado
Então é atribuído ao serverId "github" (RF-02)

Dado um tool sem servidor reconhecível
Quando correlacionado
Então cai em other-tools (RF-02)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Availability + correlation + group + invoke (RF-01–RF-04) | Should | Powers hooks MCP actions |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `copilot-mcp-utils.ts` | `queryMCPServers` (87), `correlateToolWithServer` (374), `executeMCPTool` (247) | 🟢 |

> 🔴 Correlation is heuristic — see `../questions.md`.
