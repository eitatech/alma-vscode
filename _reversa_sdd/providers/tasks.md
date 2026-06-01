# providers (module), Tarefas de Implementação

## Pré-requisitos

- [ ] Feature modules (`agent-chat`, `spec`, `hooks`, `cloud-agents`, `devin`, `orchestration`, `tasks`, `steering`) implemented
- [ ] `services` (dependency-checker, diagnostics) + `utils/get-webview-content`
- [ ] `package.json` `views`/`viewsContainers` contributions (see `questions.md`)

## Tarefas

- [ ] T-01, Register all view ids + containers
  - Origem no legado: `agent-chat-view-provider.ts:150-155`; `spec-explorer-provider.ts:42`; `orchestration-view-provider.ts:30`; `hook-view-provider.ts:303`
  - Critério de pronto: all surfaces resolve; dual chat view host-gated
  - Confiança: 🟢

- [ ] T-02, Implement `AgentChatViewProvider` + `SidebarSessionBinding`
  - Origem no legado: `agent-chat-view-provider.ts:230,556,980,1111,1264`
  - Critério de pronto: resolve/route/bind; one binding; append-only deltas; read-only/terminal rejection (R-AC-11, R-AC-3)
  - Confiança: 🟢

- [ ] T-03, Implement `SpecExplorerProvider` tree
  - Origem no legado: `spec-explorer-provider.ts:268,304-329,38`
  - Critério de pronto: 4 groups by review-flow status; 2 s debounced refresh
  - Confiança: 🟢

- [ ] T-04, Implement `HookViewProvider` (readiness + CRUD + status mirror)
  - Origem no legado: `hook-view-provider.ts:347,401,322`
  - Critério de pronto: buffer-until-ready; CRUD/logs; executor status badges
  - Confiança: 🟢

- [ ] T-05, Implement `WelcomeScreenProvider` install dispatch
  - Origem no legado: `welcome-screen-provider.ts:294,83-116`
  - Critério de pronto: per-dependency dispatch; gatomia-cli prereq gate; post-install re-probe
  - Confiança: 🟢

- [ ] T-06, Implement remaining tree providers + `CopilotProvider`
  - Origem no legado: `running-agents`/`actions`/`steering`/`wiki`/`*-progress`-provider.ts; `copilot-provider.ts:47`
  - Critério de pronto: tree projections + Copilot temp-file handoff (+WSL)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, One binding at a time; rebinding disposes prior (R-AC-11)
- [ ] TT-02, Cloud/terminal follow-up rejected (R-AC-3)
- [ ] TT-03, Spec tree groups by review-flow status (RF-05)
- [ ] TT-04, Hooks-panel buffers until ready (RF-06)

## Ordem Sugerida

1. T-01 → T-02 (chat) → T-03 (spec tree) → T-04 (hooks) → T-05 (welcome) → T-06 (rest).

## Lacunas Pendentes (🔴)

- 🔴 Confirm `package.json` view wiring + which scaffold views are live (see `questions.md`).
