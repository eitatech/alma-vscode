# providers (module), Design Técnico

> Module-level `design.md`. Source: `src/providers/`. Confidence: 🟢 unless noted.

## Interface (registered surfaces)

| Surface | Id / type | File:line |
|---------|-----------|-----------|
| Agent Chat (auxiliary) | `gatomia.views.agentChat` (WebviewView) | `agent-chat-view-provider.ts:155` |
| Agent Chat (primary) | `gatomia.views.agentChatPrimary` | `:150` |
| Specs tree | `gatomia.views.specExplorer` (TreeView) | `spec-explorer-provider.ts:42` |
| Orchestration | `gatomia.views.orchestration` (WebviewView) | `orchestration-view-provider.ts:30` |
| Hooks panel | `gatomia.hooksPanel` (WebviewPanel) | `hook-view-provider.ts:303` |

## Provider inventory

| Provider | Type | Consumes |
|----------|------|----------|
| `AgentChatViewProvider` (+`SidebarSessionBinding`) | WebviewView | `agent-chat` registry/store/model-discovery/catalog |
| `SpecExplorerProvider` | TreeDataProvider | `spec` review-flow + `SpecManager` |
| `HookViewProvider` | WebviewPanel | `hooks` manager/executor/MCP |
| `WelcomeScreenProvider` | Webview panel orchestrator | `services` (dependency/diagnostics/resources) |
| `OrchestrationViewProvider` | WebviewView | `orchestration` read-model |
| `RunningAgentsTreeProvider` | TreeDataProvider | `agent-chat` + `cloud-agents` |
| `CloudAgentProgressProvider` / `DevinProgressProvider` | TreeDataProvider | `cloud-agents` / `devin` |
| `ActionsExplorerProvider` / `SteeringExplorerProvider` / `WikiExplorerProvider` / `HooksExplorerProvider` / `QuickAccessExplorerProvider` | TreeDataProvider | resource catalogs / steering / wiki / hooks |
| `SpecTaskCodeLensProvider` | CodeLens | spec `- [ ] TXXX` lines |
| `CopilotProvider` | wrapper | Copilot Chat/CLI |

## Fluxo Principal (visão de módulo)

1. **Agent Chat** — `resolveWebviewView` → wire messages → push catalog/session-list/permission-default → bind on focus. 🟢 (→ `agent-chat-sidebar-binding/`)
2. **Spec tree** — `getChildren`: root → 4 groups → specs → files; 2 s debounced refresh. 🟢 (→ `spec-explorer-tree/`)
3. **Hooks panel** — readiness gate → CRUD/logs/status. 🟢 (→ `hooks-panel-crud/`)
4. **Welcome** — dependency detect → install dispatch → re-probe. 🟢 (→ `welcome-install/`)

## State machines / view models

- **Agent Chat sidebar view**: `empty → binding → active ⇄ (switch) → cleared`; one binding at a time. 🟢
- **Webview readiness gate** (hooks): buffer until `hooks.ready`, then flush. 🟢
- **Spec tree model**: root → `{Current | Review | Archived | Changes}`. 🟢
- **Running-agents tree**: `active / recent / orphans`. 🟢

## Dependências

- Consumes nearly every feature module (`agent-chat`, `spec`, `hooks`, `cloud-agents`, `devin`, `steering`, `orchestration`, `tasks`), plus `services`, `panels`, `utils`, `constants`. 🟢
- External: `vscode` (Tree/Webview APIs, `FileSystemWatcher`, `ThemeIcon`), `node:crypto`, `node:fs`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Providers are thin projections (no domain logic) | module-wide | 🟢 |
| One `SidebarSessionBinding` per provider (one-panel-per-session) | `agent-chat-view-provider.ts:556` | 🟢 (R-AC-11) |
| Append-only transcript delta sync | `:1264` | 🟢 |
| Dual chat view (auxiliary + primary) host-gated | `:133-150` | 🟢 |

## Estado Interno

Per-provider: the active binding, `pendingMessages` buffers, `knownMessageIds`, status caches, debounce timers. No persistence (feature modules own state). 🟢

## Observabilidade

Telemetry via `agent-chat/telemetry`; status badges mirrored from `HookExecutor`. 🟢

## Riscos e Lacunas

- 🟡 `simple-view-provider.ts` / `interactive-view-provider.ts` / `overview-provider.ts` look like scaffold/demo views — registration unclear (see `questions.md`).
- 🔴 The exact `package.json` `views`/`viewsContainers` ↔ provider wiring is not determinable from this folder (see `questions.md`; resolved in `commands`/extension).
