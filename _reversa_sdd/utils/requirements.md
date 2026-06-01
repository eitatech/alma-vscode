# utils (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra / cross-cutting**.
> Source: `src/utils/` (~4,147 LOC, 18 files). Complexity: high. **High blast radius.**
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`utils` is the **cross-cutting shared-utilities layer** consumed by every module. Five clusters: (1) the **spec-system abstraction** (`SpecSystemAdapter` — unified SpecKit/OpenSpec facade); (2) **markdown parsing** (`tasks.md`, checklists, frontmatter, friendly titles); (3) **Copilot/MCP integration** via `vscode.lm`; (4) **platform & IDE-host detection** (multi-fork data-dir/MCP-config, CLI probing); (5) **webview/chat/state/telemetry helpers** (shared webview HTML builder, chat-prompt decorator, preview telemetry). Mostly pure functions + a few singletons. 🟢

## Responsabilidades

- Resolve the active spec system + paths; list/create/getFiles across both systems. 🟢
- Parse `tasks.md` into `TaskGroup[]` with status derivation. 🟢
- Discover MCP servers/tools via `vscode.lm` and invoke tools. 🟢
- Detect IDE host + ACP eligibility; resolve data-dir / `mcp.json`; probe CLIs. 🟢
- Build CSP'd webview HTML; decorate + dispatch chat prompts. 🟢

## Regras de Negócio

- **R-SP-9** Active system: explicit `gatomia.specSystem` wins; else auto-detect; both + no pref → QuickPick + persist (cancel ⇒ default SpecKit, not persisted). 🟢 `spec-kit-adapter.ts:93-144`
- **R-SP-10** SpecKit feature dir `^\d{3,}-(.+)$`; next number = max+1; unknown files surface as `extra:`/`extra-folder:`. 🟢 `spec-kit-utilities.ts:80-167`; `spec-kit-adapter.ts:364-394`
- Task status: explicit `**STATUS**` overrides acceptance-criteria ratio; phase headers excluded via denylist. 🟢 `task-parser.ts:118-124,151-168`
- MCP discovery degrades gracefully: missing `vscode.lm`/`lm.tools` → `[]`; unmatched tools → `other-tools`. 🟢 `copilot-mcp-utils.ts:90-98,403-404`
- `executeMCPTool` calls `lm.invokeTool` with `toolInvocationToken: undefined` (outside a chat request). 🟢 `copilot-mcp-utils.ts:262-269`
- `mcp.json` profile-aware: newest-modified profile wins, else `User/mcp.json`; WSL resolves `%APPDATA%`. 🟢 `platform-utils.ts:108-167`
- `checkCLI` runs with extended PATH; on failure `which`/`where`-locates + reports `installed:false`. 🟢 `cli-detector.ts:73-188`
- **R-HK-9** ACP eligible only on Windsurf/Antigravity + non-remote (`env.remoteName` falsy). 🟢 `ide-host-detector.ts:69-74`
- **R-X-1** Webview HTML: per-render 32-char nonce + strict CSP; data-attrs HTML-escaped. 🟢 `get-webview-content.ts:36,47-65`
- **R-X-3** `buildFinalPrompt` appends global + type-specific instructions + a language directive when `chatLanguage ≠ English`. 🟢 `chat-prompt-runner.ts:46-73`
- **R-X-2** `chat.open` passes `files` only on VS Code ≥ 1.95.0. 🟢 `chat-prompt-runner.ts:91-101`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Spec-system resolution + paths | Must | pref/auto/QuickPick; SpecKit→specs/ + .specify/templates; OpenSpec→openspec/ (R-SP-9) |
| RF-02 | Spec file enumeration | Must | known-file map + `extra:` discovery; SpecKit numbering (R-SP-10) |
| RF-03 | Task parsing | Must | dual-format → `TaskGroup[]` with status derivation |
| RF-04 | MCP discovery + invoke | Should | group `lm.tools` by server; `invokeTool`; graceful empty |
| RF-05 | Host/data-dir/CLI | Must | `detectIdeHost`; `getMcpConfigPath`; `checkCLI` extended PATH |
| RF-06 | Webview HTML | Must | CSP + nonce + `data-page`; escaped attrs (R-X-1) |
| RF-07 | Chat prompt decorate+dispatch | Must | instructions + language; dispatcher or `chat.open` (R-X-2/3) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Strict CSP + nonce on all webviews | `get-webview-content.ts:36` | 🟢 |
| Resiliência | MCP/CLI/host detection never throw on absence | `copilot-mcp-utils.ts:90`; `cli-detector.ts:73` | 🟢 |
| Portabilidade | Multi-fork + WSL data-dir resolution | `platform-utils.ts:108-167` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado ambos SpecKit e OpenSpec presentes sem preferência
Quando SpecSystemAdapter.initialize roda
Então uma QuickPick é exibida e a escolha é persistida (cancelar ⇒ SpecKit não persistido) (R-SP-9)

Dado vscode.lm.tools indisponível
Quando queryMCPServers roda
Então retorna [] sem lançar

Dado chatLanguage != English
Quando buildFinalPrompt roda
Então uma diretiva de idioma é anexada (R-X-3)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Spec adapter + task parse + host/CLI + webview + chat (RF-01–RF-03, RF-05–RF-07) | Must | Hubs used everywhere |
| MCP discovery (RF-04) | Should | Powers hooks MCP actions |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `spec-kit-adapter.ts` | `SpecSystemAdapter.initialize` (83), `getSpecKitFeatureFiles` (317) | 🟢 |
| `spec-kit-utilities.ts` | `parseSpecKitDirectoryName` (80), `discoverSpecKitFeatures` (124) | 🟢 |
| `task-parser.ts` | `parseTasksContent` (89) | 🟢 |
| `copilot-mcp-utils.ts` | `queryMCPServers` (87), `executeMCPTool` (247), `correlateToolWithServer` (374) | 🟢 |
| `platform-utils.ts` / `cli-detector.ts` | `getMcpConfigPath` (108) / `checkCLI` (73) | 🟢 |
| `ide-host-detector.ts` | `detectIdeHost` (46), `isAcpCandidateHost` (69) | 🟢 |
| `get-webview-content.ts` | `getWebviewContent` (14) | 🟢 |
| `chat-prompt-runner.ts` | `buildFinalPrompt` (46), `sendPromptToChat` (75) | 🟢 |

> See `questions.md` for the 🔴 heuristic tool↔server correlation + 🟡 `ConfigManager` persistence.
