---
schemaVersion: 1
generatedAt: 2026-06-07T20:38:00Z
reversa:
  version: "1.2.34"
kind: target_screens
producedBy: screen-translator
mode: modernized
sourcePlatform: vscode-extension-ui
targetPlatform: compose
adapter: vscode_extension_ui__compose
screenCount: 14
hash: "sha256:2f857d628a775b992b5f6dab7ec308da852ce0babf11b5064139d97a7b945e0c"
---

# Target Screens

> Executable spec for each screen of the new system, derived from the legacy in **modernized** mode (`screen_modernization_decision.md`). Textual content preserved verbatim. Primary reading for the coding agent; each section is a contract.
> Format: `composable` (Compose Kotlin / Jewel) per the `vscode_extension_ui__compose` adapter extension (DEV-001). Tokens reference the Jewel/IntelliJ theme + `_reversa_sdd/design-system/tokens-derived.md` (DEV-002).

## Resumo
- **Mode applied**: modernized
- **Screens generated**: 14 (8 tree/list views + 5 panels + 1 activity-bar tree)
- **Adapter**: `vscode_extension_ui__compose` (new pair, DEV-001)
- **Tokens consumed**: Jewel/IntelliJ theme + `design-system/tokens-derived.md`
- **Golden files**: 0 emitted (modernized mode uses behavioral parity; see `screens/golden/manifest.yaml`)
- **Deviations registered**: 6 (all pending) in `screen_deviation_log.md`

## Shared pattern: VS Code tree view -> Jewel tool-window tree/list
The 8 legacy `TreeDataProvider` views (SCR-0001..0008) + the activity-bar tree (SCR-0014) become Jewel **`LazyTree`/`LazyColumn`** content hosted in IntelliJ **tool windows** (registered via `plugin.xml` `toolWindow` extension points). Common contract: node label + icon + optional badge; context actions become `AnAction` entries / right-click menu; selection drives a detail panel or editor. The 4 states apply uniformly (idle = populated tree; loading = progress while listing; error = inline banner with `{{error_message}}`; empty = empty-state text). Per-view specifics below.

---

## Tela: Specs Explorer
**Origem**: `src/providers/spec-explorer-provider.ts` (`gatomia.views.specExplorer`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree, Jewel.IconButton, token:badge.gitModified]
**Pontos de interpolação**: `{{specId}}`, `{{specStatus}}`, `{{specTitle}}`
**Transições de saída**: [Document Preview, Hooks form]
**Tela crítica?**: sim

### Especificação
```yaml
spec.kind: composable
spec.name: SpecsExplorerToolWindow
spec.legacy_origin: "src/providers/spec-explorer-provider.ts"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "Specs") {
    when (val s = vm.state) {
      Loading -> JewelProgressBar()
      is Error -> InlineBanner(text = s.message, severity = Error)
      is Empty -> EmptyState(text = "No specs found")
      is Loaded -> LazyTree(s.specs) { spec ->
        TreeRow(
          label = spec.title,                       // {{specTitle}} verbatim
          icon = statusIcon(spec.status),           // draft/review/reopened/archived
          badge = if (spec.dirty) Badge(token = "badge.gitModified"),
          onActivate = { vm.openPreview(spec.id) }, // -> Document Preview
          contextActions = [SendToReview, Archive, FileChangeRequest]
        )
      }
    }
  }
spec.viewmodel:
  name: SpecsExplorerVM
  legacy_origin: "spec-explorer-provider.getChildren"
  rules: [R-SP-1, R-SP-2, R-SP-5]   # status FSM + gates drive enabled/disabled actions
```
### Pontos de divergência aceitos
- DEV-001 (adapter pair), DEV-002 (tokens), DEV-003 (TreeView -> Jewel LazyTree).
### Estados
| Estado | Descrição | Conteúdo / mensagem |
|---|---|---|
| Idle | Populated spec tree | spec rows with status icons |
| Loading | Listing specs | progress bar |
| Error | List/parse failure | `{{error_message}}` inline banner |
| Success (empty) | No specs | "No specs found" |

---

## Telas: Actions / Steering / Repo Wiki / Quick Access (tree views)
**Origem**: `src/providers/{actions,steering,wiki,overview}-explorer-provider.ts` (`gatomia.views.{actionsExplorer,steeringExplorer,wikiExplorer,overview}`)
**Modo aplicado**: modernized — all follow the **shared tree pattern** above.
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree, token:badge.gitModified (Steering)]
**Transições**: Quick Access -> Welcome; Steering rows -> editor; Repo Wiki rows -> Document Preview.
**Crítica?**: não
### Especificação
```yaml
spec.kind: composable
spec.shared_pattern: "VS Code tree view -> Jewel LazyTree (see Shared pattern)"
spec.screens:
  - name: ActionsExplorerToolWindow      # SpecKit + Copilot assets
    legacy_origin: "actions-explorer-provider.ts"
  - name: SteeringExplorerToolWindow     # Rules / Custom / User, with git M badges
    legacy_origin: "steering-explorer-provider.ts"
    tokens: [badge.gitModified]
  - name: RepoWikiExplorerToolWindow     # docs/ + architecture/
    legacy_origin: "wiki-explorer-provider.ts"
    transitions: [Document Preview]
  - name: QuickAccessToolWindow          # Spec System / Configuration / Resources
    legacy_origin: "overview-provider.ts"
    transitions: [Welcome]
spec.states: [idle, loading, error, success]
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-003.

---

## Tela: Running Agents
**Origem**: `src/providers/running-agents-provider.ts` (`gatomia.views.runningAgents`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree, token:status.*]
**Pontos de interpolação**: `{{sessionId}}`, `{{sessionState}}`
**Transições de saída**: [Agent Chat]
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: RunningAgentsToolWindow
spec.legacy_origin: "running-agents-provider.ts"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "Running Agents") {
    Section("New session")    { NewSessionButton(onClick = vm::newSession) }
    Section("Active")         { sessionList(vm.active,   token = "status.active") }
    Section("Recent")         { sessionList(vm.recent,   token = "status.completed") }
    Section("Orphaned")       { worktreeList(vm.orphaned) }   // R-AC-5 orphaned worktrees
  }
spec.viewmodel:
  rules: [R-AC-1, R-AC-5]   # absorbing terminal -> Recent; 100-session retention -> Orphaned
```
### Estados
| Estado | Conteúdo |
|---|---|
| Idle | Sections New/Active/Recent/Orphaned |
| Loading | progress while building snapshot |
| Error | `{{error_message}}` banner (graceful, R-OR-2) |
| Success (empty) | "No active sessions" |

---

## Tela: Cloud Agents
**Origem**: `src/providers/cloud-agents-provider.ts` (`gatomia.views.cloudAgents`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree, token:badge.prOpen, token:badge.prMerged]
**Pontos de interpolação**: `{{taskId}}`, `{{prUrl}}`, `{{providerStatus}}`
**Transições de saída**: ["Open in Provider" -> external browser]
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: CloudAgentsToolWindow
spec.legacy_origin: "cloud-agents-provider.ts"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "Cloud Agents") {
    if (vm.sessions.isEmpty()) EmptyState("No cloud sessions")
    else LazyColumn(vm.sessions) { s ->
      CloudSessionRow(
        taskId = s.taskId,                     // {{taskId}} verbatim
        statusBadge = prBadge(s.pr),           // token:badge.prOpen | badge.prMerged
        actions = [OpenInProvider(s.prUrl), Cancel]   // R-CD-2 local-only cancel
      )
    }
  }
spec.viewmodel:
  rules: [R-CD-3, R-CD-8, R-CD-12]   # statusDetail override; inactive->read-only; PR->tasks.md
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-003. (External provider UI excluded from translation.)

---

## Tela: Hooks Explorer
**Origem**: `src/providers/hooks-explorer-provider.ts` (`gatomia.views.hooksExplorer`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree (grouped by action type), token:hook.actionType]
**Transições de saída**: [Hooks form]
**Tela crítica?**: não
### Especificação
```yaml
spec.kind: composable
spec.name: HooksExplorerToolWindow
spec.legacy_origin: "hooks-explorer-provider.ts"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "Hooks") {
    if (vm.hooks.isEmpty()) EmptyState("No hooks configured")
    else GroupedTree(vm.hooks.groupBy { it.action.kind }) { group, hooks ->  // group by action type
      TreeGroup(label = group, token = "hook.actionType") {
        hooks.forEach { HookRow(it.name, onActivate = { vm.editHook(it.id) }) }  // -> Hooks form
      }
    }
  }
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-003.

---

## Tela: Document Preview
**Origem**: `src/panels/document-preview-panel.ts` (WebviewPanel `document-preview`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.EditorTab, MarkdownRenderer, MermaidRenderer, Jewel.SegmentedControl(Edit/Preview)]
**Pontos de interpolação**: `{{docTitle}}`, `{{mermaidSource}}`, `{{markdownBody}}`
**Transições de saída**: [refine flow]
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: DocumentPreviewEditor
spec.legacy_origin: "src/panels/document-preview-panel.ts + ui/src/features/preview"
spec.states: [idle, loading, error, success]
spec.composable: |
  EditorTabContent(title = vm.docTitle) {          // {{docTitle}} verbatim
    SegmentedControl(["Edit", "Preview"], vm.mode)
    when (vm.mode) {
      Edit    -> CodeEditorArea(vm.source)
      Preview -> MarkdownView(
                   markdown = vm.body,              // markdown-it -> JVM markdown renderer (DEV-006)
                   mermaid = vm.mermaidBlocks       // mermaid -> JVM/JCEF-free mermaid (DEV-006)
                 )
    }
  }
spec.notes: "renders task + doc (Mermaid). Mermaid/markdown engine differs from the webview (DEV-006)."
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-006 (markdown/mermaid renderer change).
### Estados
| Estado | Conteúdo |
|---|---|
| Idle | Edit or Preview content |
| Loading | "Rendering..." while parsing markdown/mermaid |
| Error | `{{error_message}}` (e.g., invalid mermaid) |
| Success | rendered document |

---

## Tela: Agent Chat
**Origem**: `ui/src/features/agent-chat` (`gatomia.views.agentChat`, auxiliarybar)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, MessageList(virtualized), Jewel.TextArea, PendingWriteGate, token:status.*]
**Pontos de interpolação**: `{{sessionId}}`, `{{transcript}}`, `{{pendingWrite}}`, `{{capabilities}}`
**Transições de saída**: [pending-write Accept/Reject, queued follow-up]
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: AgentChatToolWindow
spec.legacy_origin: "ui/src/features/agent-chat (Zustand store + transcript)"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "Agent Chat") {
    Header { ModePicker(vm.mode); ModelPicker(vm.model); TargetPicker(vm.target, enabled = !vm.turnRan) } // R-AC-8 target immutable after first turn
    MessageList(vm.transcript, virtualized = true)         // R-AC-4 archival offload at 10k/2MB
    if (vm.pendingWrite != null)
      PendingWriteGate(vm.pendingWrite, onAccept = vm::accept, onReject = vm::reject)  // blocks until settled
    Composer(
      enabled = !vm.session.isTerminal && !vm.session.isCloudReadOnly,  // R-AC-3
      onSubmit = vm::submitTurn,                                        // R-AC-2 one queued follow-up
    )
  }
spec.viewmodel:
  name: AgentChatVM   # was Zustand store; now ViewModel over agents-context services
  rules: [R-AC-1, R-AC-2, R-AC-3, R-AC-4, R-AC-7, R-AC-8]
spec.host: "chat is hosted via JetBrains AI Assistant surface (AD-06 / AMB-005) where it exposes a participant API; otherwise rendered in this tool window"
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-005-adjacent (Zustand store -> Compose ViewModel is intrinsic to modernized).
### Estados
| Estado | Conteúdo |
|---|---|
| Idle | new-session prompt / composer |
| Loading | turn in flight (streaming) |
| Error | `{{error_message}}` (turn failed) |
| Success | active transcript |

---

## Tela: Welcome to GatomIA
**Origem**: `ui/src/features/welcome` (WebviewPanel `welcome-screen`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.EditorTab, Jewel.TabRow(Setup/Features/Configuration/Status/Learn)]
**Transições de saída**: [Setup actions -> commands]
**Tela crítica?**: não
### Especificação
```yaml
spec.kind: composable
spec.name: WelcomeEditor
spec.legacy_origin: "ui/src/features/welcome (5 tabs)"
spec.states: [idle, loading, error, success]
spec.composable: |
  EditorTabContent(title = "Welcome to GatomIA") {     // verbatim
    TabRow(["Setup", "Features", "Configuration", "Status", "Learn"], vm.tab)  // DEV-005: webview tabs -> Jewel TabRow
    when (vm.tab) {
      Setup -> SetupChecklist(vm.steps)
      Status -> HealthStatus(vm.health)                // healthy/unhealthy/missing-deps
      else -> StaticContent(vm.tab)
    }
  }
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-005 (multi-tab webview -> Jewel TabRow).

---

## Tela: Hooks Form (create/edit)
**Origem**: `ui/src/features/hooks-view` (WebviewPanel `hooks`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.EditorTab, Form, ActionTypeSelector(4 types), MCP picker, ExecutionLogPanel]
**Pontos de interpolação**: `{{hookName}}`, `{{actionConfig}}`, `{{executionLogs}}`
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: HooksFormEditor
spec.legacy_origin: "ui/src/features/hooks-view (create/edit, 4 action types + logs)"
spec.states: [idle, loading, error, success]
spec.composable: |
  EditorTabContent(title = if (vm.isNew) "Create Hook" else "Edit Hook") {
    Form(onSubmit = vm::save) {
      TextField(label = "Name", value = vm.name, validate = uniqueMax100)   // R-HK-8
      TriggerSelector(operation, agentType, timing = [Before, After])        // R-HK-1, R-HK-2
      ActionTypeSelector(["Agent", "Git", "GitHub", "MCP", "Custom", "ACP"]) // R-HK action kinds
      when (vm.actionType) {
        MCP -> McpToolPicker(vm.mcpServers)   // uses own MCP client (AMB-004)
        else -> ActionFields(vm.actionType)
      }
      VariablePicker(vm.availableVars, gating = STRICT)   // R-HK-5 + D-5 strict gating
    }
    ExecutionLogPanel(vm.logs, cap = 100)     // R-HK-4 FIFO cap
  }
```
### Pontos de divergência aceitos
- DEV-001, DEV-002.

---

## Tela: Orchestration (MAESTRO board)
**Origem**: `ui/src/features/orchestration` (`gatomia.views.orchestration`)
**Modo aplicado**: modernized
**Componentes**: [Jewel.ToolWindow, KanbanBoard(native), WorkflowGraph(native), SessionDetailPanel, token:status.*]
**Pontos de interpolação**: `{{lanes}}`, `{{sessionSummary}}`
**Transições de saída**: [session detail, Workflow Composer]
**Tela crítica?**: sim
### Especificação
```yaml
spec.kind: composable
spec.name: OrchestrationToolWindow
spec.legacy_origin: "ui/src/features/orchestration + workflow-composer (React Flow) + kanban"
spec.states: [idle, loading, error, success]
spec.composable: |
  ToolWindowContent(title = "MAESTRO") {
    TabRow(["Board", "Composer", "List"], vm.tab)
    when (vm.tab) {
      Board -> KanbanBoard(                       // DEV-004: React Flow/Kanban -> native Compose
        lanes = listOf("Running", "Blocked", "Ready"),   // R-OR-1 bucket ranks
        cards = vm.snapshot.buckets,
        onCardClick = { vm.openDetail(it) }
      )
      Composer -> WorkflowGraph(vm.graph)         // DEV-004: React Flow composer -> native graph canvas
      List -> SessionList(vm.snapshot.sessions)
    }
    if (vm.detail != null) SessionDetailPanel(vm.detail)
  }
spec.viewmodel:
  rules: [R-OR-1, R-OR-2, R-OR-3, R-OR-4]
  notes: "autonomous loop uses canonical session store + terminal-state set (D-2/D-3)"
```
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-004 (React Flow composer + Kanban -> native Compose; the AMB-002 heavy-UI rebuild).
### Estados
| Estado | Conteúdo |
|---|---|
| Idle | board lanes populated |
| Loading | building snapshot |
| Error | `degradedReasons` banner (R-OR-2, never throws) |
| Success | lanes + detail |

---

## Tela: Agent Chat (activity-bar tree)
**Origem**: `src/providers/agent-chat-primary-provider.ts` (`gatomia.views.agentChatPrimary`)
**Modo aplicado**: modernized — **shared tree pattern**. Uncaptured in `ui/inventory.md` (no screenshot); spec derived from the contributed view + the Agent Chat domain. Flag: 🟡 inferred layout.
**Componentes**: [Jewel.ToolWindow, Jewel.LazyTree]
**Transições de saída**: [Agent Chat]
**Tela crítica?**: não
### Pontos de divergência aceitos
- DEV-001, DEV-002, DEV-003.

---

## Apêndice: rastreabilidade ao inventário

| Tela (`target_screens.md`) | `ui/inventory.md` | `screens/inventory.json` |
|---|---|---|
| Specs Explorer | row 1 | SCR-0001 |
| Actions Explorer | row 2 | SCR-0002 |
| Steering Explorer | row 3 | SCR-0003 |
| Repo Wiki Explorer | row 4 | SCR-0004 |
| Running Agents | row 5 | SCR-0005 |
| Cloud Agents | row 6 | SCR-0006 |
| Hooks Explorer | row 7 | SCR-0007 |
| Quick Access | row 8 | SCR-0008 |
| Document Preview | row 9 | SCR-0009 |
| Agent Chat | row 10 | SCR-0010 |
| Welcome to GatomIA | row 12 | SCR-0011 |
| Hooks Form | row 13 | SCR-0012 |
| Orchestration (MAESTRO) | row 14 | SCR-0013 |
| Agent Chat (activity-bar tree) | "not yet captured" | SCR-0014 |

> Excluded: `ui/inventory.md` row 11 (external Devin Cloud provider UI — not gatomia-owned).
