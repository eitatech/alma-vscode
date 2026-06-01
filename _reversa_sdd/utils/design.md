# utils (module), Design Técnico

> Module-level `design.md`. Source: `src/utils/`. Confidence: 🟢 unless noted.

## Interface (hubs)

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SpecSystemAdapter.initialize` | `()` | `Promise<void>` | singleton — `spec-kit-adapter.ts:83` |
| `SpecSystemAdapter.getSpecKitFeatureFiles` | `(specId)` | file map | `:317` |
| `parseTasksContent` | `(content)` | `TaskGroup[]` | `task-parser.ts:89` |
| `queryMCPServers` / `executeMCPTool` | discovery / invoke | `MCPServer[]` / result | `copilot-mcp-utils.ts:87/247` |
| `getMcpConfigPath` / `getVSCodeUserDataPath` | path resolution | string | `platform-utils.ts:108/61` |
| `checkCLI` / `getExtendedPath` | CLI probe | result / PATH | `cli-detector.ts:73/19` |
| `detectIdeHost` / `isAcpCandidateHost` | host | host / bool | `ide-host-detector.ts:46/69` |
| `getWebviewContent` | `(opts)` | HTML | `get-webview-content.ts:14` |
| `buildFinalPrompt` / `sendPromptToChat` | decorate / dispatch | string / void | `chat-prompt-runner.ts:46/75` |

## Five clusters

| Cluster | Files |
|---------|-------|
| Spec-system | `spec-kit-adapter.ts`, `spec-kit-utilities.ts`, `spec-kit-migration.ts` |
| Markdown | `task-parser.ts`, `checklist-parser.ts`, `yaml-frontmatter-parser.ts`, `document-title-utils.ts` |
| Copilot/MCP | `copilot-mcp-utils.ts`, `copilot-chat-utils.ts` |
| Platform/host | `platform-utils.ts`, `cli-detector.ts`, `ide-host-detector.ts` |
| Webview/chat/state/telemetry | `get-webview-content.ts`, `chat-prompt-runner.ts`, `workspace-state.ts`, `telemetry.ts`, `config-manager.ts`, `notification-utils.ts` |

## Fluxo Principal (visão de módulo)

1. **Spec system** — `initialize` resolves the active system + paths (pref/auto/QuickPick). 🟢 (→ `spec-system-adapter/`)
2. **Tasks** — `parseTasksContent` → `TaskGroup[]`. 🟢 (→ `task-parser/`)
3. **MCP** — `queryMCPServers` groups `lm.tools`; `executeMCPTool` invokes. 🟢 (→ `mcp-discovery/`)
4. **CLI/host** — `checkCLI` + `detectIdeHost` + `getMcpConfigPath`. 🟢 (→ `cli-probe/`)
5. **Webview/chat** — `getWebviewContent` (CSP) + `sendPromptToChat` (decorate + dispatch). 🟢

## State machines / decision flows (6)

See `flowcharts/utils.md`: spec-system resolution (§1), task-status derivation (§2), MCP correlation (§3), mcp.json resolution (§4), checkCLI probe (§5), chat dispatch (§6).

## Dependências

- `constants`, `hooks` (`MCPServer`/`MCPTool` types), `steering` (`ConstitutionManager`), `services` (`ChatDispatcher` type). 🟢
- Consumed by **virtually everything**. 🟢 (high blast radius — `spec-impact-matrix.md` §2)
- External: `vscode` (`lm`, `env`, `version`, `Uri`), `node:fs`/`path`/`os`/`child_process`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| `SpecSystemAdapter` as the unified two-system facade (singleton) | `spec-kit-adapter.ts:83` | 🟢 (ADR-0004) |
| Strict-CSP + nonce shared webview builder | `get-webview-content.ts:36` | 🟢 |
| Layered heuristics for MCP tool↔server correlation | `copilot-mcp-utils.ts:374` | 🟢 (🔴 imperfect — questions.md) |
| Extended-PATH CLI probing with `which`/`where` fallback | `cli-detector.ts:73` | 🟢 |

## Estado Interno

Singletons: `SpecSystemAdapter`, `ConfigManager`, `TelemetryStore` (preview, in-memory, capped 1000/type). 🟢

## Observabilidade

`utils/telemetry.ts` (preview-scoped, in-memory): p95, SC-001 (95% < 3 s), SC-002 (90% diagram success). 🟢

## Riscos e Lacunas

- 🔴 `correlateToolWithServer` is heuristic — unconventional MCP tool names fall to `other-tools` (imperfect grouping). See `questions.md`.
- 🟡 `ConfigManager.saveSettings` is in-memory only (VS Code config is the real source). See `questions.md`.
- 🟡 `utils/telemetry.ts` is preview-scoped, in-memory; no external pipeline wired.
