# create-session, Tarefas de Implementação

## Pré-requisitos

- [ ] `cloud-agents` types, provider interface, storage, registry implemented (see `../tasks.md`)
- [ ] Devin REST client + GitHub GraphQL client available

## Tarefas

- [ ] T-01, Implement active-provider + credential gates
  - Origem no legado: `provider-registry.ts:72`; `flowcharts/cloud-agents.md` §1
  - Critério de pronto: no provider → error; missing credentials → prompt → error if unsaved
  - Confiança: 🟢

- [ ] T-02, Implement `DevinAdapter.createSession`
  - Origem no legado: `adapters/devin-adapter.ts:280`
  - Critério de pronto: referential prompt built; Devin REST createSession; mapped to `AgentSession` with `providerSessionId`
  - Confiança: 🟢

- [ ] T-03, Implement `GitHubCopilotAdapter.createSession`
  - Origem no legado: `adapters/github-copilot-adapter.ts:161`
  - Critério de pronto: resolve repo id; create issue with `agentAssignment`; `providerSessionId = owner/repo#number`
  - Confiança: 🟢

- [ ] T-04, Persist `PENDING` + fire `onUpdated`
  - Origem no legado: `agent-session-storage.ts`
  - Critério de pronto: session saved; UI event fired
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, No active provider → error (RF-01)
- [ ] TT-02, Devin create maps id correctly (RF-03)
- [ ] TT-03, GitHub create maps `owner/repo#number` (RF-04)
- [ ] TT-04, Created session persisted as PENDING (RF-05)

## Ordem Sugerida

1. T-01 → (T-02 ∥ T-03) → T-04.

## Lacunas Pendentes (🔴)

- 🔴 Confirm canonical Devin create path (this adapter vs `devin` module) — see `../questions.md`.
