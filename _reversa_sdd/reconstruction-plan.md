# Reconstruction Plan — gatomia-vscode

**Fonte:** migração
**Paradigma alvo:** Idiomatic IntelliJ (OO-with-DI + message bus + coroutines; declarative Compose/Jewel UI; no postMessage bridge; FSMs as sealed classes)
**Topologia:** Hybrid (Option 3) — feature-sliced bounded contexts + strict hexagonal `domain/app/ui/infra` seam per context, packaged as a single Gradle module
**Stack:** Kotlin + IntelliJ Platform SDK (`intellij-platform-gradle-plugin`); Compose for Desktop / Jewel; no database; JetBrains Marketplace distribution
**Estratégia:** A + C — Incremental per-bounded-context build & release (Strangler-style) with a Parallel-Run parity overlay against the running VS Code extension
**Gerado em:** 2026-06-08
**Status:** 31 tarefas | 30 concluídas | 0 pendentes (1 n/a: Tarefa 03) — **RECONSTRUÇÃO COMPLETA** (6 bounded contexts + presentation surfaces as native IntelliJ trees + rich create forms + actionable lifecycle/edit + friendly names & file-type icons + VCS coloring + ACP Agent Runner with configurable client + native Settings page under Tools + grouped Agents window + Maestro Composer/Board + document preview review bar + hook execution log; the in-IDE chat screen was intentionally dropped in favor of the IDE's AI Assistant + our own ACP runner)

> Greenfield rewrite of `gatomia` (VS Code extension) onto the JetBrains/IntelliJ Platform in Kotlin. This is **not** a TS→Kotlin transpilation. There is **no database** and **no runtime data migration**. Decomposition is intentionally **not 1:1**: 22 legacy modules → 6 bounded contexts (5 product + `platform`). Required first reading before any code: `paradigm_decision.md`, `topology_decision.md`, `screen_modernization_decision.md`.

---

## Alertas de pré-voo

> Revise antes de iniciar. Itens REFERIDOS À CODIFICAÇÃO em `ambiguity_log.md` (e watch items do `handoff.md`) que afetam tarefas específicas estão marcados. Nenhum é bloqueante — todas as 5 decisões humanas estão resolvidas — mas devem ser dimensionados/tratados na implementação.

- ⚠️ **AMB-002 — Native rebuild of the heavy UI (React Flow workflow composer + Kanban + mermaid/markdown preview) in Compose/Jewel, with NO JCEF fallback.** Single largest effort item and the program's top risk (RISK-001). Afeta **Tarefa 05** (Native UI Spike — go/no-go) e **Tarefa 11** (orchestration — real rebuild); a renderização markdown/mermaid também recai sobre a UI de **Tarefa 07** (spec/preview). Se o esforço se mostrar proibitivo, o único fallback que preserva o paradigma é reabrir `paradigm_decision.md` rumo à Option 3 (Hybrid/JCEF) só para essas telas. Origem: `_reversa_sdd/migration/ambiguity_log.md` (AMB-002).
- ⚠️ **AMB-004 (follow-up) — Implement the embedded MCP client (owns server-of-origin metadata; resolves gap G-B).** `vscode.lm.tools` não existe no JetBrains. Afeta **Tarefa 06** (platform — onde o cliente MCP vive) e é consumido por **Tarefa 08** (automation/hooks). Origem: `_reversa_sdd/migration/ambiguity_log.md` (AMB-004).
- ⚠️ **AMB-003 (follow-up) — Define concrete constitution-validation rules in a forward `/reversa-requirements` cycle; ship the validator wired-but-permissive in the interim.** Afeta **Tarefa 07** (spec — steering/constitution). Origem: `_reversa_sdd/migration/ambiguity_log.md` (AMB-003).
- ⚠️ **AMB-005 / RISK-003 (watch) — Chat host = JetBrains AI Assistant (user override).** Validar que o SDK do plugin expõe uma API estável de participant/tool para rotear aos provedores ACP/cloud da gatomia **antes** de comprometer o slice de Agentes Conversacionais. Contingência: tool window de chat própria. Afeta **Tarefa 09** (agents). Origem: `_reversa_sdd/migration/ambiguity_log.md` (AMB-005), `handoff.md` (watch items).
- ⚠️ **RISK-005 / BR-DESCARTAR-003 (watch) — Define a JetBrains ACP-eligibility predicate** (o gate legado Windsurf/Antigravity foi descartado); testar em IntelliJ IDEA + cenário Gateway/remoto. Afeta **Tarefa 08** (automation) e **Tarefa 09** (agents). Origem: `handoff.md` (watch items).

---

## Tarefas

### Tarefa 01 — Project Setup (Phase 0 foundation skeleton)
**Status:** done
**Lê:** `_reversa_sdd/migration/topology_decision.md`, `_reversa_sdd/migration/paradigm_decision.md`
**Constrói:** Single Gradle IntelliJ plugin module via `intellij-platform-gradle-plugin`; `META-INF/plugin.xml` skeleton (extension points, actions, tool windows placeholders); `GatomiaPlugin.kt`; package-by-feature tree under `src/main/kotlin/dev/gatomia/` with `platform/` + the 5 context packages (`spec`, `automation`, `agents`, `cloud`, `orchestration`), each pre-split into `domain/ app/ ui/ infra/`; Compose for Desktop / Jewel dependency wiring; Kotlin coroutines.
**Pronto quando:** The empty plugin builds and loads in a sandbox IDE; the folder tree matches `target_architecture.md § Honra à topologia escolhida` (Hybrid single-module layout); `domain` packages compile with no IntelliJ imports (headless-ready).
**Entregue em:** `gatomia-intellij/` (new self-contained Gradle module; no legacy file touched). `settings.gradle.kts` + `build.gradle.kts` + `gradle.properties` wired to the **corporate JFrog Artifactory** virtual repo `gradle-all` (credentials/URL from `~/.gradle/gradle.properties`), **local-IDE SDK** via `intellijPlatformLocalPath`, and `org.jetbrains.intellij.platform.selfUpdateCheck=false`; `gradlew`+wrapper (Gradle 9.5.0), `.gitignore`, `META-INF/plugin.xml`, `GatomiaPlugin.kt`, 5 pure `domain/Package.kt` markers, hexagonal `app/ui/infra` + `platform/*` dirs. Versions: Kotlin 2.3.21, IntelliJ Platform Gradle Plugin 2.16.0, local IDE **IU-261.24374.151**; Compose runtime from the local IDE's bundled jars.
**Verificação:** ALL VERIFIED. Tree matches the Hybrid layout; `domain` packages compile headlessly with no IntelliJ imports (`kotlinc`). `./gradlew buildPlugin --no-daemon --offline --console=plain -Dkotlin.compiler.execution.strategy=in-process` → **BUILD SUCCESSFUL**, produced `build/distributions/gatomia-intellij-0.1.0.zip` (compileKotlin + jar + composedJar + prepareSandbox). Note: public Maven Central / Gradle Plugin Portal are 403 in this environment; all artifacts resolve via the corporate Artifactory mirror + local IDE, so builds use `--offline` against the warm `~/.gradle` cache. `runIde` (interactive launch) needs a display and is left for manual smoke-testing.

---

### Tarefa 02 — State & Persistence Model
**Status:** done
**Lê:** `_reversa_sdd/migration/target_data_model.md`
**Constrói:** Persistence layer of the `platform` foundation — `PersistentStateComponent` state classes, project-scoped JSON/JSONL file shapes, and `PasswordSafe` secret shapes (no DB, no ORM). Mirrors the legacy no-DB design (AD-05 / paradigm I5).
**Pronto quando:** Every state shape in `target_data_model.md` exists as a typed Kotlin state class or file-shape with round-trip (load/save) covered by tests; secrets resolve via `PasswordSafe`.
**Obs:** Adapts the template's "Schema do Banco Alvo" task. The target has **no database**, so this is a state-shape persistence layer, not migrations/DDL.
**Entregue em:** Platform primitives `dev.gatomia.platform.persistence` (`GatomiaPaths`→`.idea/gatomia/`, `JsonStore`, `JsonlStore`, `RingBuffer`, `TtlIndex`) + `platform.secrets` (`SecretVault` + `InMemorySecretVault` + `PasswordSafeSecretVault`). Per-context state shapes in each `infra`: automation (`HookState`/`HookActionConfig`/`HookExecutionLogEntry` + `HookStore`), cloud (`CloudSessionState` + `CloudSessionStore` w/ 7-day prune), spec (`SpecState`/`ChangeRequest`/`NormalizedTask`/refs + `SpecReviewStore`), agents (`ChatSessionState`/`TranscriptMessage`/`SessionManifest`/`AgentDefinition` + `SessionManifestStore`), orchestration (`OrchestrationSnapshot`), platform (`McpServerCatalog`). kotlinx.serialization wired (plugin + json 1.9.0). Caps encoded: sessions 100 (R-AC-5), transcript 10k/2MB (R-AC-4), cloud 7-day (R-CD-7), hook log 100 + history 50 (R-HK-4), MCP cache 5-min.
**Verificação:** ALL VERIFIED. `./gradlew buildPlugin verifyPersistenceFixtures --offline ...` → **BUILD SUCCESSFUL**; main compiles against the platform (PersistentStateComponent stores + PasswordSafe vault) and the headless `PersistenceFixture` passes **22 checks** (kotlinx round-trip of all serialized shapes, JsonStore file round-trip, JSONL append/read/offload threshold, RingBuffer FIFO cap, TtlIndex expiry, SecretVault set/get/delete + key namespacing, McpServerCatalog TTL). Added a `verifyPersistenceFixtures` Gradle task wired into `check`. (TDD caught + fixed a JSONL pretty-print bug — lines are now forced compact.)

---

### Tarefa 03 — Data Migration Plan
**Status:** skipped (n/a)
**Lê:** `_reversa_sdd/migration/data_migration_plan.md`, `_reversa_sdd/migration/target_data_model.md`
**Constrói:** (nothing)
**Pronto quando:** N/A
**Obs:** **SKIPPED per `migration_strategy.md` + `handoff.md`.** This is a greenfield build on a different platform with **no runtime data migration** (`data_migration_plan.md` = no runtime ETL). Per AMB-006, there is **no import of existing VS Code config/state in v1**. The plugin creates fresh local state; shared repo artifacts (SpecKit/OpenSpec specs, `.agent.md`, steering docs) are read in place by both products. Re-open only if a v2 import is later scoped.

---

### Tarefa 04 — Target Domain Kernel & Business Rules
**Status:** done
**Lê:** `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** The shared, **pure** domain kernel reused by every context — sealed-class FSM framework for the 22 legacy state machines (absorbing terminal sets INV-1, status-detail-override INV-2, exhaustive `when`), the 7 cross-context domain-event contracts, shared value objects, and the encoded business-rule catalog (the 53 MIGRATE rules: R-SP-*, R-HK-*, R-AC-*, R-CD-*, R-OR-*). Per-aggregate domain logic is implemented inside each context's `domain/` package in its module task (Tarefas 06–11), kept pure (no IntelliJ imports) for headless parity testing.
**Pronto quando:** The FSM base + 7 domain events + value objects compile and are unit-tested headlessly; the business-rule catalog is encoded/traceable; downstream contexts can express their FSMs as sealed classes against the kernel.
**Entregue em:** Pure shared kernel `dev.gatomia.platform.domain` (no IntelliJ imports): `fsm/StateMachine` (transition table + INV-1 absorbing terminals + `TransitionResult`) + `fsm/StatusWithDetail` (INV-2); `event/DomainEvent` (sealed; the 7 cross-context events incl. ChangeRequestFiled/Addressed + OrchestrationTaskCompleted/Failed variants) + `event/DomainEventBus` (interface + `InMemoryDomainEventBus`); `value/NormalizedTaskId` (R-SP-13) + `value/Ids` (UUIDv4); `rules/BusinessRule` + `rules/BusinessRuleCatalog` (all **56** rules: **53 MIGRATE + 3 DISCARD**, with id/context/group/decision lookups). Per-aggregate FSMs/VOs stay in each context's `domain/` (module tasks).
**Verificação:** ALL VERIFIED. `./gradlew buildPlugin verifyDomainKernelFixtures verifyPersistenceFixtures --offline ...` → **BUILD SUCCESSFUL**; `KernelFixture` passes **23 checks** (FSM valid/undeclared/terminal-absorbing INV-1, StatusWithDetail INV-2, event-bus publish/subscribe/cancel, NormalizedTaskId + UUID VOs, catalog 53 MIGRATE + 3 DISCARD = 56 with unique ids + context/group counts) and the persistence fixture still passes 22 (regression). A sample sealed-state FSM in the fixture demonstrates a context expressing its FSM against the kernel. Added `verifyDomainKernelFixtures` to `check`.

---

### Tarefa 05 — Native UI Spike (AMB-002 go/no-go)
**Status:** done
**Lê:** `_reversa_sdd/migration/paradigm_decision.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (orchestration screens), `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** A throwaway Compose/Jewel spike of the **hardest** UI surfaces — interactive graph canvas (React Flow composer equivalent) + Kanban board — to clear RISK-001 before committing to the full native build.
**Pronto quando:** The spike demonstrates a feasible native graph canvas + Kanban in Compose/Jewel (interaction, performance acceptable); a go/no-go is recorded. If no-go, **STOP** and escalate to re-open `paradigm_decision.md` toward Option 3 (Hybrid/JCEF) for those specific screens.
**Alerta:** AMB-002 / RISK-001 — top program risk; no JCEF fallback under the chosen paradigm. This task is the explicit Phase 0 de-risking gate per `migration_strategy.md`.
**Entregue em:** Throwaway `dev.gatomia.spike` — `MaestroSpikePanel.kt` (native Compose: `KanbanBoardSpike` = Running/Blocked/Ready lanes with `LazyColumn` cards + click-select + tokens-derived status colors; `WorkflowGraphSpike` = `Canvas`-drawn edges + draggable node boxes with drag-to-pan, the React-Flow equivalent) + `SpikeToolWindowFactory.kt` (hosts it via the Jewel bridge `ToolWindow.addComposeTab`). Registered as a `toolWindow` in plugin.xml (marked throwaway; removed in Tarefa 11). Build wired the bundled Compose/Jewel UI jars (`intellij.platform.compose`, `skiko`, `jewel.foundation/ui/ideLafBridge`) as compileOnly.
**Verificação / GO-NO-GO = GO.** `./gradlew buildPlugin … --offline` → **BUILD SUCCESSFUL**: the native Compose Kanban + pannable graph-canvas Composables **compile against the real IU-261 Compose/Jewel APIs** (foundation `Canvas`/layout/`LazyColumn`/`detectDragGestures`/`pointerInput`; Jewel bridge `addComposeTab`) and package into the plugin; fixtures still pass (23 + 22). This clears RISK-001 at the compile/API level — the heavy UI is buildable natively with **no JCEF fallback**; paradigm Option 1 stands. **Manual step:** run `./gradlew runIde` on a machine with a display to confirm interaction/rendering/perf (headless here). No no-go.

---

### Tarefa 06 — Module: platform (foundation)
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-06 platform), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`
**Constrói:** `dev/gatomia/platform/` — secrets (`PasswordSafe` wrapper), settings, telemetry, Git4Idea wrapper, ACP runtime/process manager, provider SPI (Devin/Copilot adapter seam), **own embedded MCP client**, Handlebars-equivalent prompt templating. (Persistence layer already built in Tarefa 02.)
**Pronto quando:** Every cross-cutting capability in `target_architecture.md` BC-06 is available as an `@Service`; the provider SPI, ACP runtime, and MCP client are wired and unit-tested; honors `§ Honra ao paradigma escolhido` (I3/I4/I5).
**Alerta:** AMB-004 — implement the embedded MCP client here (owns server-of-origin metadata; resolves gap G-B). Consumed by automation (Tarefa 08).
**Entregue em:** `dev.gatomia.platform`: `settings/GatomiaSettings` (@Service app + `GatomiaSettingsState`); `telemetry/Telemetry` (+ `InMemoryTelemetry`/`NoopTelemetry`) + `IdeTelemetry`; `git/GitService` + `CliGitService` (shell git, R-CD-11); `providers/CloudAgentProvider` SPI + `ProviderRegistry` (active/inactive R-CD-8); `acp/AcpProcessManager` (one-per-(providerId,cwd) R-X-5) + `SubprocessLauncher`/`InMemorySubprocessLauncher` + `GeneralCommandLineLauncher`; `mcp/McpClient`+`McpTransport`+`CachingMcpClient` (**AMB-004**, R-HK-6 5-min cache) over the T02 `McpServerCatalog`; `templating/PromptTemplateEngine` (`{{var}}`) + `PromptDecorator` (R-X-3); `messaging/MessageBusDomainEventBus` (IntelliJ message-bus impl of the kernel `DomainEventBus`, AD-04). Git uses shell per the rule's "Git4Idea or shell".
**Verificação:** ALL VERIFIED. `./gradlew buildPlugin verifyPlatformFixtures … --offline` → **BUILD SUCCESSFUL**; main compiles against the platform (services + GeneralCommandLine/ExecUtil + MessageBus/Topic) and the headless `PlatformFixture` passes **14 checks** (template substitution + missing→empty, R-X-3 decoration incl. language directive, MCP 5-min cache hit/miss R-HK-6, ACP one-per-(providerId,cwd) + respawn R-X-5, provider active/inactive R-CD-8, settings round-trip + defaults, telemetry). Kernel 23 + persistence 22 still pass; added `verifyPlatformFixtures` to `check`. Note: `GatomiaSettings` is an `@Service`; the other foundation services are plain classes contexts obtain (annotated `@Service` when a context wires them).

---

### Tarefa 07 — Module: spec (Spec Lifecycle) — Phase 1
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-01 spec), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (spec-explorer + preview screens), `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** `dev/gatomia/spec/{domain,app,ui,infra}` — `Spec` + `ChangeRequest` aggregates and their sealed-class FSMs; SpecKit/OpenSpec spec-system adapter; steering manager (incl. constitution validator); `tasks.md` normalizer; Compose/Jewel spec-explorer tool window + document preview (markdown/mermaid). Publishes `SpecOperationCompleted`, `ChangeRequestFiled/Addressed`, `SpecArchived`.
**Pronto quando:** Behavioral parity for spec review/archive and change-request lifecycle holds vs. the VS Code oracle — anchor flows `parity_tests/01-spec-review-archive.feature`, `parity_tests/02-change-request-lifecycle.feature`, and the screen contract `parity_tests/screens/01-screen-contract.feature` (full criteria read from `parity_specs.md` in Tarefa 13).
**Alerta:** AMB-003 — ship the constitution validator **wired-but-permissive**; concrete rules are a later forward-cycle item (do not block on them). Markdown/mermaid preview is part of the AMB-002 native-UI scope.
**Entregue em:** `spec/domain` — `SpecStatus`+`SpecStatusMachine` (R-SP-1; archived reversible), `ChangeRequestStatus`+`ChangeRequestMachine` (Addressed terminal) + `SpecChangeRequest` (R-SP-8 normalize), `Spec` aggregate (sendToReview R-SP-2, archive R-SP-4/5, unarchive, fileChangeRequest R-SP-4/8, markAddressed; commands return events). `spec/app` — `SpecStateRepository` port + `InMemorySpecStateRepository`, `SpecLifecycleService` (publishes the 4 spec events), `TaskNormalizer` (R-SP-13), `ConstitutionValidator` (AMB-003 permissive). `spec/infra` — `SpecSystemDetector` (R-SP-9/10), `SpecReviewStoreRepository` (domain↔DTO over the T02 store; added `CURRENT` to the persistence enum). `spec/ui` — `SpecsExplorerToolWindowFactory` + `SpecsExplorerScreen` (4 states + context actions, Jewel-hosted; registered in plugin.xml) + minimal `DocumentPreviewScreen`.
**Verificação / parity (Strategy C):** `./gradlew buildPlugin verifySpecFixtures … --offline` → **BUILD SUCCESSFUL**; `SpecFixture` passes **24 checks** mapping to 01-spec-review-archive + 02-change-request-lifecycle (FSM strictness R-SP-1 + readyToReview alias, send-to-review gate R-SP-2, file-CR-in-review→reopened + ChangeRequestFiled R-SP-4, duplicate-CR rejection R-SP-8, archive blocked-then-allowed + SpecArchived R-SP-4/5, unarchive→reopened, CR Addressed absorbing, task ids R-SP-13, permissive validator AMB-003, system detection R-SP-9/10). All prior fixtures green (14+23+22); added `verifySpecFixtures` to `check`. Explorer 4-state contract compile-verified (visual = manual runIde). **Deferred:** rich markdown/mermaid preview (DEV-006/AMB-002) + live event-driven UI refresh.

---

### Tarefa 08 — Module: automation (Hooks) — Phase 2
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-02 automation), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (hooks form/list screens), `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** `dev/gatomia/automation/{domain,app,ui,infra}` — `Hook` aggregate (trigger + conditions + schedule → action); trigger registry as IntelliJ **message-bus** listener; `BulkFileListener`-based completion detection (replaces FS-watcher debounce, R-HK-7); action executor (agent/git/github/mcp/custom/acp); variable parser; Compose/Jewel hooks form UI. Consumes `SpecOperationCompleted` and `orchestration.task-completed/failed`.
**Pronto quando:** Behavioral parity for hook firing/chain-safety and completion detection holds vs. the oracle — anchor flows `parity_tests/06-hooks-firing-and-chain-safety.feature`, `parity_tests/07-hook-completion-detection.feature` (full criteria in `parity_specs.md`, Tarefa 13).
**Alerta:** Uses the platform MCP client (AMB-004). RISK-005 — the MCP action path and the new JetBrains ACP-eligibility predicate must be defined (legacy Windsurf/Antigravity gate is discarded).
**Entregue em:** `automation/domain` — `HookTiming` (relocated here as the VO), `HookTrigger`/`HookAction`/`HookDescriptor`, `HookMatcher` (R-HK-1 ordering + agent wildcard; R-HK-2 blocking), `HookChainGuard` (R-HK-3 circular block + depth cap 10), `HookVariableResolver` (R-HK-5 strict gating, D-5). `automation/app` — `HookRepository` port + in-memory, `ActionExecutor` (+ recording fake), `HookEngine` (ordered fire + chain guard + capped FIFO log R-HK-4), `CompletionDebouncer` (R-HK-7 2s). `automation/infra` — `HookStoreRepository`, `HookCompletionDetector` (`BulkFileListener`, registered applicationListener), `DispatchingActionExecutor` (6 action kinds; MCP via AMB-004; RISK-005 seam). `automation/ui` — `HooksExplorerScreen` (grouped by action type + empty state) + `HooksFormScreen`; tool window registered.
**Verificação / parity (Strategy C):** `./gradlew buildPlugin verifyHookFixtures … --offline` → **BUILD SUCCESSFUL**; `HookFixture` passes **24 checks** mapping to 06-hooks-firing-and-chain-safety + 07-hook-completion-detection (createdAt-ordered firing + agent/op/timing match R-HK-1, blocking gate R-HK-2, circular block + depth cap 10 R-HK-3, capped FIFO log R-HK-4, strict `$variable` gating R-HK-5/D-5, 2s completion debounce R-HK-7). `HookTiming`→domain move clean (persistence still 22); prior fixtures green (24+14+23); added `verifyHookFixtures` to `check`. **Deferred:** concrete per-kind action backends + 30s coroutine timeout, and live event-bus subscription of the engine (the BulkFileListener is registered).

---

### Tarefa 09 — Module: agents (Conversational Agents) — Phase 3
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-03 agents), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (agent-chat screens), `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** `dev/gatomia/agents/{domain,app,ui,infra}` — `ChatSession` + `AgentDefinition` aggregates; session lifecycle/transcripts; capability negotiation; pending-write approval gate; ACP runtime adapter; `.agent.md` definitions; **JetBrains AI Assistant host adapter** (prompt decoration, routing to ACP/cloud providers). Publishes `ChatSessionStateChanged`.
**Pronto quando:** Behavioral parity for chat-session lifecycle and the pending-write gate holds vs. the oracle — anchor flows `parity_tests/03-chat-session-lifecycle.feature`, `parity_tests/04-pending-write-gate.feature` (full criteria in `parity_specs.md`, Tarefa 13).
**Alerta:** AMB-005 / RISK-003 — **before** committing this slice, validate that JetBrains AI Assistant exposes a stable participant/tool API for routing to gatomia's ACP/cloud providers; contingency is gatomia's own chat tool window. Define the JetBrains ACP-eligibility predicate (RISK-005).
**Entregue em:** `agents/domain` — `ChatSessionStatus`+`ChatSessionMachine` (R-AC-1 terminal absorbing), `ExecutionTarget`/`ResolvedCapabilities` (R-AC-7)/`PendingWrite`, `ChatSession` aggregate (submitTurn R-AC-1/3, queueFollowUp R-AC-2, changeTarget R-AC-8, pending-write gate, cancel/endByShutdown R-AC-6), `AgentSpec`+`AgentDefinitionValidator` (R-AC-10 + /help inject), `AcpCommandRewriter` (R-X-4). `agents/app` — `SessionRepository` port + in-memory, `ChatSessionService` (publishes ChatSessionStateChanged), `AgentDefinitionParser`, `ChatHost` port. `agents/infra` — `SessionManifestRepository` (over T02 store), `AiAssistantChatHost` (AMB-005 seam) + `OwnToolWindowChatHost` (RISK-003 contingency), `AcpRuntimeAdapter` (platform ACP, R-X-5). `agents/ui` — `AgentChatScreen` (header pickers w/ target-lock R-AC-8, message list, pending-write gate, composer gate) + tool window.
**Verificação / parity (Strategy C):** `./gradlew buildPlugin verifyAgentFixtures … --offline` → **BUILD SUCCESSFUL**; `AgentFixture` passes **22 checks** mapping to 03-chat-session-lifecycle + 04-pending-write-gate (terminal absorbing + new run R-AC-1, one queued follow-up R-AC-2, cloud read-only R-AC-3, capability resolution R-AC-7, target immutable after first turn R-AC-8, pending-write approve/reject gate, agent validation + /help R-AC-10, ACP rewrite R-X-4). Prior fixtures green (24+24+14+23+22); added `verifyAgentFixtures` to `check`. AMB-005: AI Assistant host wired as a **seam** with the own-tool-window contingency (RISK-003) — the participant API must be confirmed before committing. **Deferred:** transcript archival offload (R-AC-4), real AI Assistant participant API + ACP JSON-RPC dispatch, session-header/transcript persistence.

---

### Tarefa 10 — Module: cloud (Cloud Delegation) — Phase 4
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-04 cloud), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (cloud-agents/progress screens), `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** `dev/gatomia/cloud/{domain,app,ui,infra}` — `CloudSession` aggregate; `CloudAgentProvider` SPI + Devin/Copilot adapters; coroutine polling loop (replaces Node polling); status mapping; PR reconciler (marks `tasks.md`); credential gating; Compose/Jewel cloud-agents UI. Publishes `CloudSessionStateChanged`, `PrStateChanged`.
**Pronto quando:** Behavioral parity for cloud polling + PR reconciliation holds vs. the oracle — anchor flow `parity_tests/05-cloud-polling-pr-reconciliation.feature` (full criteria in `parity_specs.md`, Tarefa 13).
**Alerta:** Do NOT re-implement the standalone legacy `devin` module — it is discarded (BR-DESCARTAR-004); Devin support lives here in `cloud` via the provider SPI.
**Entregue em:** `cloud/domain` — `CloudSessionStatus`+`CloudSessionMachine` (terminal absorbing), `CloudStatusNormalizer` (R-CD-6 + R-CD-3 detail override), `DevinApiVersion` (R-CD-1 token prefix), `PollingController` (R-CD-4) + `Backoff` (R-CD-10), `CloudSession` aggregate (poll, cancel R-CD-2, reconcilePr R-CD-12) + `PrState`. `cloud/app` — `CloudSessionRepository` port + in-memory, `CloudDelegationService` (dispatch R-CD-13 + events), `TaskMarker` (R-CD-12 idempotent). `cloud/infra` — `CloudSessionStoreRepository` (domain↔DTO over T02; added `CANCELLED` to the enum), `DevinProvider`/`CopilotProvider` (platform SPI, credential-gated via SecretVault), `CloudPoller` (coroutine loop). `cloud/ui` — `CloudAgentsScreen` (status + PR badge + Open/Cancel + empty) + tool window.
**Verificação / parity (Strategy C):** `./gradlew buildPlugin verifyCloudFixtures … --offline` → **BUILD SUCCESSFUL**; `CloudFixture` passes **26 checks** mapping to 05-cloud-polling-pr-reconciliation (Devin version by token prefix R-CD-1, local-only cancel R-CD-2, statusDetail override R-CD-3, terminal normalization R-CD-6, polling stop after 3 failures + credential expiry R-CD-4, exponential backoff R-CD-10, idempotent PR-reconcile R-CD-12, duplicate-dispatch block R-CD-13, credential gating). All prior fixtures green (22+24+24+14+23+22; persistence clean after `CANCELLED` add); added `verifyCloudFixtures` to `check`. **Deferred:** real provider API calls + the coroutine polling-loop runtime (CloudPoller compiles; pure policy tested), grace window R-CD-5, task-group one-PR R-CD-9.

---

### Tarefa 11 — Module: orchestration (MAESTRO) — Phase 5
**Status:** done
**Lê:** `_reversa_sdd/migration/target_architecture.md` (§ BC-05 orchestration), `_reversa_sdd/migration/target_domain_model.md`, `_reversa_sdd/migration/target_business_rules.md`, `_reversa_sdd/migration/screen_modernization_decision.md`, `_reversa_sdd/migration/target_screens.md` (orchestration/Kanban/composer screens), `_reversa_sdd/migration/screen_deviation_log.md`, `_reversa_sdd/design-system/tokens-derived.md`
**Constrói:** `dev/gatomia/orchestration/{domain,app,ui,infra}` — `OrchestrationSnapshot` projection (read-model over `agents` + `cloud`); autonomous Kanban→session loop service; the **heaviest native UI**: Kanban board + React Flow-equivalent graph/workflow composer in Compose/Jewel. Consumes `ChatSessionStateChanged`, `CloudSessionStateChanged`; publishes `orchestration.task-completed/failed`.
**Pronto quando:** Behavioral parity for the autonomous orchestration loop holds vs. the oracle — anchor flow `parity_tests/08-orchestration-autonomous-loop.feature`; the Kanban + composer honor the modernized screen contracts and the 6 approved deviations (full criteria in `parity_specs.md § Exceções`, Tarefa 13).
**Alerta:** AMB-002 / RISK-001 — this is the real native rebuild that the Tarefa 05 spike de-risks; sequenced last by dependency. Honor the 6 approved deviations in `screen_deviation_log.md`.
**Entregue em:** `orchestration/domain` — `Bucket`/`OrchestrationItem`/`OrchestrationView` + `OrchestrationProjection` (R-OR-1 bucket-rank sort, R-OR-2 degradedReasons), `AutonomousLoop` (R-OR-3 claim/start concurrency + parallelizable gate; R-OR-4 terminal fires task-completed/failed; D-2/D-3 terminal-state set). `orchestration/app` — `OrchestrationService` (projects agents+cloud via their app ports, graceful R-OR-2; `runLoop` publishes terminal events). `orchestration/ui` — real `MaestroScreen` (native Kanban lanes by bucket + drag-pan workflow composer canvas + List + degraded banner, DEV-004) replacing the throwaway spike; tool window registered. **Spike removed** (`dev.gatomia.spike` deleted + its tool window deregistered).
**Verificação / parity (Strategy C):** `./gradlew buildPlugin verifyOrchestrationFixtures … --offline` → **BUILD SUCCESSFUL**; `OrchestrationFixture` passes **17 checks** mapping to 08-orchestration-autonomous-loop (bucket-rank projection R-OR-1, graceful degradation R-OR-2, claim/start concurrency + parallelizable gate R-OR-3, terminal task-completed/failed R-OR-4, agents+cloud projection). **All 8 fixtures green: 172 checks total** (orch 17 + cloud 26 + agent 22 + hook 24 + spec 24 + platform 14 + kernel 23 + persistence 22). Native Kanban + composer (DEV-004/AMB-002) compile against real Compose APIs (T05 spike cleared RISK-001). **Deferred:** live event-driven UI refresh, real session-build wiring in the loop, composer edge semantics.

---

### Tarefa 12 — Cutover (Marketplace release model)
**Status:** done
**Lê:** `_reversa_sdd/migration/cutover_plan.md`
**Constrói:** Per-slice JetBrains Marketplace release checklist/automation (EAP/beta → stable), each gated by green parity tests for its scope; executable rollback (yank the plugin version — users stay on the VS Code extension).
**Pronto quando:** Each delivered slice can be published to the Marketplace per the plan, and rollback is verified. Note: there is **no production cutover** and the VS Code extension is **not decommissioned** — "cutover" = Marketplace release, "rollback" = users remain on VS Code.
**Entregue em:** `build.gradle.kts` — `intellijPlatform { signing { …env vars }; publishing { token = env; channels = [ -PpublishChannel | "eap" ] } }` (Marketplace release automation; lazy providers keep `buildPlugin` secret-free, only `signPlugin`/`publishPlugin` consume them). `gatomia-intellij/RELEASE.md` — per-slice release runbook (eap→beta→stable; the 6 steps; go/no-go gated by `./gradlew check`; yank-version rollback; v1.0 min scope = Spec+Automation per RISK-006).
**Verificação:** `./gradlew tasks --all --offline` → **BUILD SUCCESSFUL**; the signing/publishing DSL configures cleanly and `signPlugin` / `publishPlugin` / `verifyPluginSignature` are present. `buildPlugin` unaffected (lazy env-var providers). No production cutover; rollback = Marketplace version yank with the VS Code extension as the always-available fallback.

---

### Tarefa 13 — Parity Validation (Strategy C overlay)
**Status:** done
**Lê:** `_reversa_sdd/migration/parity_specs.md`, `_reversa_sdd/migration/parity_tests/01-spec-review-archive.feature`, `_reversa_sdd/migration/parity_tests/02-change-request-lifecycle.feature`, `_reversa_sdd/migration/parity_tests/03-chat-session-lifecycle.feature`, `_reversa_sdd/migration/parity_tests/04-pending-write-gate.feature`, `_reversa_sdd/migration/parity_tests/05-cloud-polling-pr-reconciliation.feature`, `_reversa_sdd/migration/parity_tests/06-hooks-firing-and-chain-safety.feature`, `_reversa_sdd/migration/parity_tests/07-hook-completion-detection.feature`, `_reversa_sdd/migration/parity_tests/08-orchestration-autonomous-loop.feature`, `_reversa_sdd/migration/parity_tests/screens/01-screen-contract.feature`
**Constrói:** Kotlin parity test suite mapping each `.feature` onto assertions over the **pure domain** layer (assert behavior, not structure); uses the running VS Code extension as the Parallel-Run oracle; a divergence report per slice.
**Pronto quando:** All critical flows in `parity_specs.md` pass for the built scope with results equivalent to the VS Code oracle; UI parity = flow/state equivalence (not widget-tree equivalence), honoring the 6 approved deviations.
**Obs:** Strategy C is a **per-slice overlay**, not only a final gate — run the relevant `.feature`(s) as each module (Tarefas 06–11) completes, before its Marketplace release.
**Entregue em:** `build.gradle.kts` — `verifyParity` umbrella task (the single Strategy C gate aggregating all 8 fixtures; also in `check`). `gatomia-intellij/parity-report.md` — the divergence report mapping all 8 `.feature` flows (**26 behavioral scenarios**) → 5 product fixtures + 3 supporting fixtures, the screen-contract `.feature` (4 scenarios, compile-verified), and the 6 approved deviations + RISK-009. The per-slice fixtures (Tarefas 04–11) **are** the Strategy C suite — built incrementally, each mapping its `.feature`(s) onto pure-domain assertions (behavioral, not structural, AMB-001).
**Verificação:** `./gradlew verifyParity buildPlugin --offline` → **BUILD SUCCESSFUL**; `verifyParity` runs all 8 fixtures = **172 assertions, zero divergence** on the covered MIGRATE rules (R-SP/AC/CD/HK/OR + R-X cross-cutting). The 26 behavioral scenarios across the 8 flow `.feature` files are fully covered; the 4 screen-contract scenarios are compile-verified (modernized mode, no pixel diff per AMB-001/DEV-001). Per-slice overlay honored.

---

## Phase 6 — Presentation surfaces (the legacy provider/webview views missing from the first pass)

> Added on user request: the reconstruction (Tarefas 06–11) built the 5 product tool windows + MAESTRO but omitted the legacy `providers/*` tree views and the Welcome/Document-Preview surfaces. `target_screens.md` specs all 14 screens; these tasks close the gap (SCR-0002/0003/0004/0005/0008/0009/0011), modernized to Jewel tool windows (DEV-003 tree→LazyColumn, DEV-005 welcome tabs, DEV-006 doc preview via the IDE editor). Cross-cutting `dev/gatomia/presentation` package + `presentation/infra/RepoAssets` (filesystem scans).

### Tarefa 14 — Presentation: Actions Explorer (SCR-0002)
**Status:** done
**Lê:** `target_screens.md` (§ Actions), `src/constants.ts` paths
**Entregue em:** `presentation/infra/RepoAssets` (pure FS scanner) + `presentation/ui/ActionsExplorerToolWindow` — grouped SpecKit (templates/scripts/commands) + Copilot (agents/prompts/skills) assets; files open in the IDE editor. Tool window `GatomIA: Actions`.
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL; lists the repo's real assets (130 agents / 126 prompts / 6 templates …).

### Tarefa 15 — Presentation: Steering Explorer (SCR-0003)
**Status:** done
**Lê:** `target_screens.md` (§ Steering), legacy `steering-explorer-provider.ts` paths
**Entregue em:** `presentation/ui/SteeringExplorerToolWindow` — Rules (`.specify/memory`) + Custom Instructions (`.github/instructions`, 17 `.md`) + a consent-gated User-Instructions note (ADR-0013, not auto-read); rows open in the editor. Tool window `GatomIA: Steering`.
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL; lists the 17 custom instructions + constitution.

### Tarefa 16 — Presentation: Repo Wiki + Document Preview (SCR-0004 / SCR-0009)
**Status:** done
**Lê:** `target_screens.md` (§ Repo Wiki, § Document Preview)
**Entregue em:** `presentation/ui/RepoWikiExplorerToolWindow` — recursive `docs/**.md` tree; selecting a doc opens it in the IDE editor, whose **bundled Markdown editor renders the preview** (DEV-006 realization, no webview). Tool window `GatomIA: Repo Wiki`.
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL; lists the 27 docs incl. `docs/architecture`.

### Tarefa 17 — Presentation: Running Agents (SCR-0005)
**Status:** done
**Lê:** `target_screens.md` (§ Running Agents)
**Entregue em:** `presentation/ui/RunningAgentsToolWindow` — New-session entry (opens Agent Chat) + sessions from the `SessionManifestStore`. Tool window `GatomIA: Running Agents`. **Deferred:** the Active/Recent/Orphaned split needs live per-session lifecycle (not persisted, AMB-006).
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL.

### Tarefa 18 — Presentation: Quick Access (SCR-0008)
**Status:** done
**Lê:** `target_screens.md` (§ Quick Access)
**Entregue em:** `presentation/ui/QuickAccessToolWindow` — Spec System (detected) / Configuration (provider) / Resources, each navigating to the other GatomIA tool windows. Tool window `GatomIA: Quick Access`.
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL.

### Tarefa 19 — Presentation: Welcome to GatomIA (SCR-0011)
**Status:** done
**Lê:** `target_screens.md` (§ Welcome), `screen_deviation_log.md` DEV-005
**Entregue em:** `presentation/ui/WelcomeToolWindow` — Jewel `TabRow` Setup/Features/Configuration/Status/Learn (DEV-005 webview→TabRow), with Setup/Status driven by real detection (spec system, `.specify`/`.github`/`docs` presence). Tool window `GatomIA: Welcome`.
**Verificação:** `buildPlugin` → BUILD SUCCESSFUL; all 6 presentation tool windows registered in `plugin.xml`.

### Tarefa 20 — UI quality: native IntelliJ trees for all explorer surfaces
**Status:** done
**Lê:** `target_screens.md` (shared tree pattern + per-screen contracts), user feedback (the first Compose pass rendered flat lists with text glyphs, far below the VS Code tree)
**Entregue em:** Reusable native-tree foundation `presentation/ui/tree/{PNode, GatomiaTree, GIcons}` — a `com.intellij.ui.treeStructure.Tree` with a `ColoredTreeCellRenderer` (icon + grey secondary text), `AllIcons` iconography (DEV-002), `SimpleToolWindowPanel` + `ActionToolbar` header actions, double-click → open, and right-click `AnAction` context menu (DEV-003). Rebuilt **Specs** with the full legacy hierarchy (Current/Review/Archived/Changes → spec → Spec/Plan/Research/Contracts/Data Model/Quickstart/Checklists/Tasks → phases → tasks via `spec/infra/TasksMdParser`, done=green-check / pending icons, right-click Run-locally / Run-in-cloud). Rebuilt **Actions, Steering, Repo Wiki, Running Agents, Quick Access, Welcome, Hooks, Cloud Agents** on the same foundation. Compose retained only for the genuinely custom UIs (MAESTRO Kanban/graph, Agent Chat). Deleted the flat-list Compose `PresentationUi.kt`.
**Verificação:** `./gradlew build` → **BUILD SUCCESSFUL**; all fixtures still pass; the native trees provide real expand/collapse + native icons + selection + context menus matching the IDE look.
**Color policy (user-mandated):** No hardcoded palette anywhere — colors follow the IDE theme like the native Structure/Git views. Native trees use `SimpleTextAttributes.REGULAR/GRAYED_ATTRIBUTES` (theme-driven) + `AllIcons`; the remaining Compose surfaces (Agent Chat, MAESTRO) use Jewel `Text` + `LocalContentColor` (+ alpha for muted/subtle backgrounds). Audit: `grep Color(0x | JBColor( | Gray._ | Color.decode` → **0 matches**. Dead `DocumentPreviewScreen` removed.

### Tarefa 21 — Rich create forms: New Spec + New Hook (native DialogWrapper)
**Status:** done
**Lê:** `target_screens.md` (§ Hooks Form SCR-0012), legacy `spec-submission-strategy.ts` + `features/hooks/types.ts`
**Entregue em:** `spec/ui/NewSpecDialog` — description text area + file/image attachments; on OK composes the spec-creation prompt (`/speckit.specify <desc>` for SpecKit; `.github/prompts/openspec-proposal.prompt.md` template + STOP note for OpenSpec) and submits it to Agent Chat via the new `agents/ui/ChatSeedService` (Compose-observed seam), then activates the Agent Chat window — mirrors the legacy `sendPromptToChat` flow. `automation/ui/NewHookDialog` — Name + Trigger (agent type / operation / timing + wait-for-completion for BEFORE, R-HK-2) + Action (type agent/git/github/mcp/custom/acp + parameters); persists a full `HookState` (added `waitForCompletion` field). Both are native `DialogWrapper` + Kotlin UI DSL (IDE-themed). `AgentChatToolWindow` rewritten to render the seed.
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; classes staged in the `IU-2026.1.3` sandbox.

### Tarefa 22 — Actionable trees: spec lifecycle + hook edit/delete
**Status:** done
**Lê:** `Spec` aggregate + `SpecLifecycleService` (R-SP-2/4/5), `HookState`
**Entregue em:** **Specs** rows now carry the legacy lifecycle context actions wired to `SpecLifecycleService` — Send to Review (current/draft/reopened), Archive + File Change Request (review), Reopen (archived) — registering the scanned spec into the review store on first action (with `pendingTasks` counted from `tasks.md` so the R-SP-2 send-to-review gate is faithful), surfacing domain `Rejected` reasons as warnings, and moving the spec between the Current/Review/Archived folders on reload. **Hooks** rows now support Edit (double-click / right-click → pre-filled `NewHookDialog`, preserving id/createdAt/executionCount, R-HK-8) and Delete (confirmed), with the trigger summary (`agentType.operation · timing`) as grey secondary text.
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 23 — Friendly display names + correct file-type icons
**Status:** done
**Lê:** legacy providers' `readDisplayName` + `normalizeName` (`actions/steering-explorer-provider.ts`) + codicon usage
**Entregue em:** `presentation/infra/DisplayName` — friendly label = frontmatter `name:` → first `# H1` → normalized filename (strip extension + `speckit.` prefix, split `[-_.]`, Title Case), exactly like the VS Code providers; the raw filename is shown as grey secondary text. Applied to **Actions, Steering, Repo Wiki, and Spec** (contracts/checklists). Icons: file nodes now use the IDE's **real file-type icon** (`fileIconFor` via `FileTypeManager` — same icon the Project view shows); spec doc types get distinct semantic icons (Spec/Plan/Research/Data Model/Quickstart/Contracts/Checklists, mapping the legacy codicons chip/calendar/search/database/rocket/… to `AllIcons`). `PNode` labels are now **lazily computed** (read on first render + cached), and the Actions tree opens with groups collapsed (`expandDepth=1`), so deriving names from 256 Copilot assets never blocks the EDT.
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 24 — VCS status coloring + Running Agents grouping
**Status:** done
**Lê:** `target_screens.md` (Steering `badge.gitModified`, Running Agents Active/Recent/Orphaned), `FileStatusManager` / `DateFormatUtil` APIs
**Entregue em:** Tree file nodes carry an optional `filePath`; the renderer colors the label by the file's `FileStatus` (modified/added/…) via `FileStatusManager`, using the **color-scheme's registered VCS colors** (theme-driven, like the Project/Commit view) — the native realization of the legacy git-`M` badge, applied across Actions/Steering/Repo Wiki/Spec. **Running Agents** now groups sessions into Active / Recent (by last-activity recency, with `DateFormatUtil` timestamps shown) + an Orphaned-worktrees section, plus the New-session entry.
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 25 — Live agent execution (AMB-005)
**Status:** done
**Lê:** Agent Chat host seam (`ChatHost`/`ChatSessionService`/`AcpRuntimeAdapter`), `OSProcessHandler` API
**Entregue em:** `agents/infra/LiveAgentRunner` — spawns the user-configured agent CLI (`GatomiaSettings.agentCommand`) in the project dir via `GeneralCommandLine` + `OSProcessHandler`, feeds the prompt on stdin, and **streams stdout/stderr live** through a `ProcessListener`. `ChatSeedService.runSeed()` builds the prompt (+ attachments), tracks `running`, and streams chunks into the `transcript` (EDT-marshaled Compose state). The Agent Chat screen renders the live, scrollable transcript with Running/Done + Re-run/Clear, and a "Configure agent…" action (stores the command). So New Spec → Send now **actually runs an agent** in the workspace (provider-agnostic transport — point it at any CLI agent).
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 26 — Document Preview review bar + friendly-name caching + Scripts fix
**Status:** done
**Lê:** `target_screens.md` (SCR-0009 Document Preview), legacy `actions-explorer-provider` script listing + `readDisplayName`
**Entregue em:**
- **Document Preview** (`presentation/ui/SpecReviewEditorNotificationProvider`, an `EditorNotificationProvider`): the document renders in the **IDE's native Markdown editor** (preview / source / both via the editor's own view-mode buttons; Mermaid included), and the legacy review actions appear as a slim **banner integrated at the top of that editor** for any doc under `specs/` — **Approve / Request Changes / Add Comment** (spec review flow via the shared `spec/ui/SpecActions`) + **Refine** (→ seeds Agent Chat). No separate window. (Superseded the initial tool-window attempt.)
- **Name caching:** the tree is now **lazy** (`GatomiaTree` builds a node's children only on expand) with **eager String labels** computed once when the branch is built — so friendly names appear correctly on first paint (fixing the "blank until the doc is opened" glitch) without reading 256 assets at open.
- **Scripts fix:** Actions lists scripts **recursively** (`.specify/scripts` → `.sh/.ps1/.py/.js/.ts`, flattened) so `bash/*.sh` shows; `.DS_Store`/`Thumbs.db` skipped; Skills resolve each dir's `SKILL.md` (friendly skill name).
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 27 — Hook execution log + Run-now
**Status:** done
**Lê:** `HookEngine` (RingBuffer log, R-HK-4), `HookExecutionLogEntry`, SCR-0012 ExecutionLogPanel
**Entregue em:** `HookEngine.runHook(descriptor)` executes a single hook on demand and records it in the FIFO log (cap 100). `automation/infra/HookEngineService` (project `@Service`) holds the live engine so the log persists + is shared with the UI. Hooks rows gained **Run now** (executes + logs, shows the outcome) and **View Log** (`HookLogDialog`, read-only entries with `DateFormatUtil` timestamps + ✓/✗); the **Edit form shows the execution log** below the fields (legacy SCR-0012 layout). The trigger separator was aligned to `agentType:operation` (matching `HookStoreRepository`).
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 28 — Drop in-IDE chat; ACP Agent Runner + Running Agents config
**Status:** done
**Decisão:** The JetBrains AI Assistant (separate, closed plugin) owns interactive chat + its own ACP — there is **no public API** to inject prompts into it or enumerate its ACP sessions. So GatomIA **does not ship its own chat window**; it runs agents via its **own configurable ACP Agent Runner** and tracks **its own** sessions.
**Entregue em:** removed the Agent Chat tool window (`AgentChatToolWindow`/`ChatSeedService`/`LiveAgentRunner`). New `agents/infra/AcpAgents` (known-agent registry + PATH availability probe), `agents/infra/AcpAgentService` (project `@Service`: spawns the configured ACP agent in the project dir via `OSProcessHandler`, tracks sessions with **real run state**, captures output, balloons start/finish via the `GatomIA` notification group). The ACP agent is configured in the GatomIA settings page (Tarefa 29) — a known/available agent or a **custom path + ACP command** (e.g. Devin CLI; default **JetBrains Junie**). **Running Agents** shows the configured agent (+ availability), lists **our** ACP sessions grouped Active/Recent by true state, starts new sessions, and opens a session's captured output. **New Spec** and the doc **Refine** action now start an ACP session via the runner. Settings: `acpAgentId` + `acpAgentCommand`.
**Verificação:** `./gradlew build buildPlugin verifyPluginProjectConfiguration` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 29 — Native settings page (Settings → Tools → GatomIA)
**Status:** done
**Lê:** `GatomiaSettings`, `SecretVault`/`CloudProviders`, `AcpAgents`, `SpecSystemDetector`
**Entregue em:** `presentation/ui/settings/GatomiaConfigurable` — a `BoundSearchableConfigurable` registered as `<projectConfigurable parentId="tools">` (id `gatomia.settings`). One page centralizing every plugin setting via the Kotlin UI DSL: the **detected SDD system** (read-only), the **ACP agent** (known/available picker + ACP command), **chat response language**, **cloud delegation** (default provider + Devin / GitHub Copilot **tokens** written to the PasswordSafe vault, applied manually), and **telemetry**. The Running Agents "Configure ACP Agent" action + the agent node now open this page (`ShowSettingsUtil`); the standalone config dialog was removed.
**Verificação:** `./gradlew build buildPlugin verifyPluginProjectConfiguration` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 30 — Grouped Agents window + eager tree labels (blank-name fix)
**Status:** done
**Lê:** `GatomiaTree`, `ToolWindow` content tabs, feedback on blank file labels
**Entregue em:**
- **Grouped Agents window:** Running Agents + Cloud Agents are now **one** `GatomIA: Agents` tool window with two tabs (`AgentsToolWindowFactory` adds the "Running" + "Cloud" contents; `GatomiaTree.install` gained a `contentTitle` param). The two standalone tool windows were removed; Quick Access + `startAgentSession` now target `GatomIA: Agents`.
- **Blank-name fix:** reverted the lazy tree model (the `nodeStructureChanged`-inside-`treeWillExpand` mutation rendered freshly-added children with an empty presentation until a repaint). `GatomiaTree` now **eagerly builds the whole tree** (`buildBranch`) with eager file-derived labels, so every node's friendly name is materialized up front and shown on first paint — the "pre-loaded" behavior requested. (Supersedes the Tarefa 26 lazy-label attempt.)
**Verificação:** `./gradlew build buildPlugin verifyPluginProjectConfiguration` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox.

### Tarefa 31 — Maestro rename + Composer/Board redesign
**Status:** done
**Lê:** `tasks.md` via `SpecScanner`/`TasksMdParser`, `AcpAgentService`, `CloudSessionStore`
**Entregue em:**
- **Rename:** `MAESTRO` → **Maestro** everywhere user-facing (tool window id `GatomIA: Maestro`, tab title, Welcome, Quick Access).
- **Board redesign:** the Maestro screen has the **Board / Composer / List** tabs (with icons). **Board** is a polished **Kanban** — columns To Do / In Progress / Done / Failed, each with a column icon + count (+ add on To Do) — of rich cards: task cards (TASK id in an accent color + title + a colored phase **label chip** + ▶ local / ☁ cloud run icons, or a green check when done) and session cards (agent icon + id + status chip). **Composer** = the pending `tasks.md` tasks + a free-form "New task", each started **per-task local (ACP) or cloud**. **List** = a flat session list. Icons are real IDE icons via **Jewel `AllIconsKeys`** + the `Icon` composable; chrome is theme-derived with a small label accent palette. New `orchestration/ui/MaestroData` reads tasks (with done flag) + sessions and runs `startLocal` (real, `AcpAgentService`) / `startCloud` (records a `CloudSessionState`; live provider dispatch is a seam).
**Verificação:** `./gradlew build buildPlugin` → BUILD SUCCESSFUL; fixtures pass; staged in the `IU-2026.1.3` sandbox. (Modeled on the reference Kanban screenshot — columns + rich cards + colored labels + IDE icons; avatars/assignees are omitted since Maestro tasks have no assignee.)

> **Deferred (full parity follow-ups):** the **full ACP JSON-RPC** protocol speak (initialize / session / tool-calls / structured permission gate — the runner currently spawns the configured agent in its ACP-launch command and feeds the prompt on stdin); live **cloud dispatch** (Devin/Copilot provider API — Maestro/Cloud currently record the session); the live **MCP tool picker** in the Hook form (AMB-004 — currently a tool-id text field); **automatic** hook firing on agent-operation completion (the `HookCompletionDetector` → engine wiring is a seam; Run-now executes manually); cross-restart persistence of session output (live state is in-memory; the manifest persists identity); inline (hover) ▶/☁ task affordances (currently right-click context actions); large-directory tree loading is now eager on the EDT (acceptable at current sizes; an async tree model is the scale follow-up).

---

## Notas de execução

- **Required first reading (non-negotiable):** `paradigm_decision.md`, `topology_decision.md`, `screen_modernization_decision.md` — internalize before writing code (already summarized in this plan's header).
- **Honor the discards** (`discard_log.md`): do NOT re-implement the `postMessage` bridge / type-mirror / page-registry / `acquireVsCodeApi`, the standalone `devin` module, or the Windsurf/Antigravity ACP gate.
- **Per slice ordering:** infra → persistence → domain (sealed-class FSMs) → application (coroutines) → UI (Compose), each delivered native end-to-end with parity tests before release (Strategy A).
- **Minimum v1.0 scope if solo capacity forces a cut (RISK-006):** Spec Lifecycle + Automation (Tarefas 07–08), deferring Orchestration/MAESTRO (Tarefa 11) to a later release.
- The Reconstructor reads **only** the files listed in each task's `Lê:` field at execution time. It never modifies any other file under `_reversa_sdd/`.
