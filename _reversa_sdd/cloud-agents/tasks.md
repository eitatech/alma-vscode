# cloud-agents (module), Tarefas de Implementação

## Pré-requisitos

- [ ] VS Code `SecretStorage` + `Memento` (`workspaceState`) available
- [ ] `devin` credentials manager + API client available (reused by `DevinAdapter`) — see `questions.md`
- [ ] `fetch` + GitHub GraphQL access for the Copilot adapter

## Tarefas

- [ ] T-01, Define `types.ts` (canonical session/task/PR model + enums + errors)
  - Origem no legado: `types.ts:19,37,70,91,138,166,186,206,232,258,271`
  - Critério de pronto: all data-dictionary types compile
  - Confiança: 🟢

- [ ] T-02, Define the `CloudAgentProvider` interface contract
  - Origem no legado: `cloud-agent-provider.ts:85,103,128`
  - Critério de pronto: createSession/pollSessions/cancelSession/getExternalUrl/handleBlockedSession (see `contracts.md`)
  - Confiança: 🟢

- [ ] T-03, Implement `AgentSessionStorage` (CRUD + load-time normalize)
  - Origem no legado: `agent-session-storage.ts:88,149,167,248`
  - Critério de pronto: persists to `workspaceState`; validates + normalizes on load; PR reconciliation by URL
  - Confiança: 🟢

- [ ] T-04, Implement `ProviderRegistry` (register/activate/restore)
  - Origem no legado: `provider-registry.ts:72,83,107`
  - Critério de pronto: must register before activation; restore active across restarts
  - Confiança: 🟢

- [ ] T-05, Implement adapters (`DevinAdapter`, `GitHubCopilotAdapter`)
  - Origem no legado: `adapters/devin-adapter.ts:157,280,354`; `adapters/github-copilot-adapter.ts:161,372`
  - Critério de pronto: provider-specific create + status mapping per `contracts.md`
  - Confiança: 🟢

- [ ] T-06, Implement `MigrationService` (legacy Devin)
  - Origem no legado: `migration-service.ts:65,90`
  - Critério de pronto: detects legacy config → auto-activate; clears orphaned active provider
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Create via active provider returns PENDING + persists (RF-01)
- [ ] TT-02, Terminal normalization derives task + PR states (R-CD-6)
- [ ] TT-03, Inactive provider sessions become read-only and are skipped (R-CD-8)
- [ ] TT-04, Migration auto-activates legacy Devin (RF-07)

## Ordem Sugerida

1. T-01 (types) → T-02 (interface) → T-03 (storage) → T-04 (registry).
2. T-05 (adapters), then the use-case folders (`create-session`, `polling-and-normalization`, `session-retention-cleanup`).
3. T-06 (migration) independent.

## Lacunas Pendentes (🔴)

- 🔴 Resolve Devin ownership overlap with the `devin` module before wiring polling (see `questions.md`).
