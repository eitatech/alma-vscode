# Code/Spec Matrix — gatomia

> Produced by the Reversa Writer (geração phase). Maps legacy source → SDD units.
> Granularity: **module + primary file** (a per-file matrix over 650 files would be low-value; primary files per module are catalogued in `code-analysis.md`).
> Coverage: 🟢 covered by a unit spec · 🟡 partial / shared · n/a = not spec-mapped (candidate for follow-up).
> Layout: `hybrid` (module folder + nested use-case folders) under `_reversa_sdd/`.

---

## Conversational Agents

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/features/agent-chat/acp-chat-runner.ts` | `agent-chat/start-and-run-session` | 🟢 |
| `src/features/agent-chat/agent-chat-session-store.ts` | `agent-chat/transcript-archival` + module | 🟢 |
| `src/features/agent-chat/agent-worktree-service.ts` | `agent-chat/worktree-lifecycle` | 🟢 |
| `src/features/agent-chat/{registry,capabilities,model-discovery,pending-writes,cloud-chat-adapter,diff-stats,types}.ts` | `agent-chat` (module) | 🟢 |
| `src/features/agents/{agent-loader,chat-participant-registry,tool-registry,resource-cache,file-watcher,error-formatter,types}.ts` | `agents/{register-chat-participants,resource-hot-reload,tool-execution}` | 🟢 |
| `src/features/agents/tools/*` | `agents/tool-execution` | 🟢 |

## Cloud Delegation

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/features/cloud-agents/cloud-agent-provider.ts` + `adapters/*` | `cloud-agents/create-session` + `contracts.md` | 🟢 |
| `src/features/cloud-agents/agent-polling-service.ts` + `agent-session-storage.ts` | `cloud-agents/polling-and-normalization` | 🟢 |
| `src/features/cloud-agents/session-cleanup-service.ts` | `cloud-agents/session-retention-cleanup` | 🟢 |
| `src/features/cloud-agents/{provider-registry,migration-service,provider-config-store,logging,types}.ts` | `cloud-agents` (module) | 🟢 |
| `src/features/devin/devin-session-manager.ts` + `git-*`, `batch-processor.ts`, `spec-content-reader.ts` | `devin/initiate-task` | 🟢 |
| `src/features/devin/devin-polling-service.ts` + `status-mapper.ts` | `devin/polling-cycle` | 🟢 |
| `src/features/devin/spec-status-updater.ts` + `pr-review-integration.ts` | `devin/pr-state-task-sync` | 🟢 |
| `src/features/devin/{api-client*,api-http,errors,retry-handler,rate-limiter,credentials,storage,config,entities,types}.ts` | `devin` (module) + `contracts.md` | 🟢 |
| `src/features/devin/{network-recovery,session-timeout-handler}.ts` | `devin` (module, NFR) | 🟡 |

## Spec Lifecycle

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/features/spec/review-flow/state.ts` | `spec/{status-fsm,send-to-review-gating,change-request-lifecycle}` | 🟢 |
| `src/features/spec/review-flow/{change-requests-service,duplicate-guard,tasks-dispatch,storage,telemetry,types}.ts` | `spec/change-request-lifecycle` (+ 🔴 `tasks-dispatch` mock → `spec/questions.md`) | 🟢/🔴 |
| `src/features/spec/{create-spec-input-controller,spec-submission-strategy}.ts` | `spec/create-spec` | 🟢 |
| `src/features/spec/{spec-manager,spec-kit-manager,types}.ts` | `spec` (module) | 🟢 |
| `src/features/steering/{steering-manager,constitution-manager}.ts` | `steering/create-project-docs` (+ 🔴 `validateConstitution` stub) | 🟢/🔴 |
| `src/features/steering/global-resource-access-consent.ts` | `steering/global-resource-consent` | 🟢 |
| `src/features/steering/instruction-rules.ts` | `steering/create-instruction-rule` | 🟢 |
| `src/features/tasks/{task-service,task-model}.ts` | `tasks/resolve-and-dispatch` + module | 🟢 |
| `src/features/tasks/{speckit,openspec}-task-provider.ts` | `tasks/{provider-selection,status-mapping}` | 🟢 |

## Automation

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/features/hooks/hook-executor.ts` | `hooks/{execute-hook-on-operation,trigger-matching-and-blocking,execution-chain-guard}` | 🟢 |
| `src/features/hooks/hook-manager.ts` | `hooks/hook-load-migration` + module | 🟢 |
| `src/features/hooks/services/command-completion-detector.ts` + `trigger-registry.ts` | `hooks/execute-hook-on-operation` | 🟢 |
| `src/features/hooks/actions/*` | `hooks/execute-hook-on-operation` + `contracts.md` | 🟢 |
| `src/features/hooks/services/mcp-*.ts` | `hooks` (module) + `utils/mcp-discovery` | 🟢 |
| `src/features/hooks/template-variable-{parser,constants}.ts` | `hooks/execute-hook-on-operation` (+ 🔴 `validateVariables` stub) | 🟢/🔴 |
| `src/features/hooks/{agent-registry,*-agent-discovery,file-watcher-service,types}.ts` | `hooks` (module) | 🟡 |

## Orchestration (MAESTRO)

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/features/orchestration/orchestration-read-model.ts` | `orchestration/aggregate-snapshot` | 🟢 |
| `src/features/orchestration/autonomous-agent-loop.ts` | `orchestration/{autonomous-task-loop,claim-task}` (🔴 non-canonical session) | 🟢/🔴 |

## Presentation infra (extension)

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `src/providers/agent-chat-view-provider.ts` | `providers/agent-chat-sidebar-binding` | 🟢 |
| `src/providers/spec-explorer-provider.ts` | `providers/spec-explorer-tree` | 🟢 |
| `src/providers/hook-view-provider.ts` | `providers/hooks-panel-crud` | 🟢 |
| `src/providers/welcome-screen-provider.ts` | `providers/welcome-install` | 🟢 |
| `src/providers/{running-agents,actions,steering,wiki,hooks,quick-access,*-progress}-*-provider.ts`, `copilot-provider.ts`, `spec-task-code-lens-provider.ts` | `providers` (module) | 🟢 |
| `src/providers/{simple,interactive,overview}-*.ts` | n/a | 🟡 (scaffold — `providers/questions.md`) |
| `src/services/acp/*` | `services/acp-client-lifecycle` + `permission-and-write-approval` + `contracts.md` | 🟢 |
| `src/services/{chat-router,chat-dispatcher}.ts` | `services/chat-routing-dispatch` | 🟢 |
| `src/services/{document-preview-service,document-dependency-tracker,refinement-gateway}.ts` | `services/document-refinement` | 🟢 |
| `src/services/{agent-service,prompt-loader,configuration-service,onboarding-service,dependency-checker}.ts` + `welcome/*` | `services` (module) | 🟢 |
| `src/panels/agent-chat-panel.ts` | `panels/{agent-chat-panel-lifecycle,input-submit-delivery}` | 🟢 |
| `src/panels/{welcome-screen,document-preview}-panel.ts` | `panels` (module) | 🟢 |
| `src/panels/new-session-panel.ts` | `panels/new-session-panel` (🟡 dormant) | 🟢/🟡 |
| `src/panels/cloud-agent-progress-panel.ts` + handler | `panels/cloud-agent-progress-panel` | 🟢 |
| `src/panels/devin-progress-panel.ts` + handler | `panels` (module, 🟡 dormant) | 🟡 |
| `src/commands/agent-chat-commands.ts` | `commands/{start-new-session,open-for-session,change-model,worktree-cleanup}` | 🟢 |
| `src/commands/cloud-agent-commands.ts` | `commands/cloud-dispatch` | 🟢 |
| `src/commands/agent-chat-new-session.ts` | `commands/start-new-session` | 🟢 |
| `src/commands/devin-commands.ts` | `commands` (module) | 🟢 |
| `src/utils/spec-kit-adapter.ts` + `spec-kit-utilities.ts` | `utils/spec-system-adapter` | 🟢 |
| `src/utils/task-parser.ts` | `utils/task-parser` | 🟢 |
| `src/utils/copilot-mcp-utils.ts` | `utils/mcp-discovery` | 🟢 |
| `src/utils/{cli-detector,platform-utils,ide-host-detector}.ts` | `utils/cli-probe` | 🟢 |
| `src/utils/{get-webview-content,chat-prompt-runner,config-manager,telemetry,spec-kit-migration,checklist-parser,yaml-frontmatter-parser,*-utils,workspace-state}.ts` | `utils` (module) | 🟢 |
| `src/prompts/*.prompt.md` + `target/*` | `prompts/{prompt-build-pipeline,runtime-consumption}` | 🟢 |

## Webview (`ui/src/`)

| Legacy path | Unit(s) | Coverage |
|-------------|---------|----------|
| `ui/src/features/agent-chat/*` | `webview-agent-chat/{bridge-lifecycle,message-reducer-routing,inputbar-composer-gating}` | 🟢 |
| `ui/src/components/spec-explorer/*`, `features/{create-spec,create-steering,interactive,simple}-view/*`, `services/spec-explorer.ts`, `stores/spec-explorer-store.ts` | `webview-spec-explorer/{spec-review-flow,change-request-form,create-spec-steering}` (🔴 R-X-6 drift) | 🟢/🔴 |
| `ui/src/features/hooks-view/*`, `components/{hooks,cli-options}/*`, `lib/mcp-utils.ts` | `webview-hooks-view/{hooks-crud,mcp-discovery-grouping,action-form-routing}` (🔴 duplicate components) | 🟢/🔴 |
| `ui/src/features/{orchestration,workflow-composer}/*`, `components/{workflow,workflow-graph,kanban,devin,cloud-agents}/*`, stores | `webview-orchestration/{orchestration-lanes,workflow-composer,unmounted-prototypes}` (🔴 unmounted) | 🟢/🔴 |
| `ui/src/features/preview/*`, `components/{preview,refine,forms}/*`, `lib/markdown/*` | `webview-preview/{preview-lifecycle,refinement-flow,interactive-form,markdown-pipeline}` | 🟢 |
| `ui/src/features/welcome/*` | `webview-welcome/{welcome-lifecycle,setup-actions,requirement-profile}` | 🟢 |
| `ui/src/{index,page-registry}.tsx`, `bridge/vscode.ts`, `components/ui/*`, `lib/utils.ts`, `utils/relative-time.ts` | `webview-shared/{bootstrap-page-selection,bridge-resolution,themed-primitives}` | 🟢 |

---

## Globals

| Artifact | Status |
|----------|--------|
| `user-stories/*.md` (6 cross-cutting flows) | 🟢 generated |
| `openapi/` | **n/a** — the extension serves no HTTP API; it *consumes* Devin REST (`devin/contracts.md`) + GitHub GraphQL (`cloud-agents/contracts.md`). No served-API OpenAPI emitted. 🟢 (decision) |
| `traceability/code-spec-matrix.md` | this file 🟢 |

## Coverage summary

- **22 modules** spec'd (15 extension + 7 webview); **~95 units** (module + use-case).
- **Module/primary-file coverage:** 🟢 high — every primary file in `code-analysis.md` maps to a unit.
- **n/a / 🟡 candidates:** scaffold providers (`simple/interactive/overview`), dormant panels (`new-session`, `devin-progress`), and webview duplicate/unmounted components — all tracked in per-module `questions.md`.
- **🔴 gaps carried forward** (7, for the Reviewer): Devin ownership overlap, autonomous-loop session shape, CR→tasks mock, `validateVariables`/`validateConstitution` stubs, unmounted webview prototypes, `webview-spec-explorer` R-X-6 drift, spec `009` lineage gap.

> Files not individually listed are covered by their module's `requirements.md`/`design.md` rastreabilidade tables. Per-file drill-down available there.
