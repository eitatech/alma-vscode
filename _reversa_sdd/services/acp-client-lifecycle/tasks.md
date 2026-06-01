# acp-client-lifecycle, Tarefas de Implementação

## Pré-requisitos

- [ ] `@agentclientprotocol/sdk` + `node:child_process`/`stream`
- [ ] `utils/cli-detector` + `getExtendedPath()`

## Tarefas

- [ ] T-01, Implement spawn + connection + initialize (coalesced)
  - Origem no legado: `acp-client.ts:433,555,628,655`
  - Critério de pronto: shared start promise; `ndJsonStream` + `ClientSideConnection.initialize`; startup timeout
  - Confiança: 🟢

- [ ] T-02, Implement `sendPrompt` (create-on-demand + once cleanup)
  - Origem no legado: `acp-client.ts:453,483,512,706`
  - Critério de pronto: session created if absent; `connection.prompt`; `once:` deleted post-turn
  - Confiança: 🟢

- [ ] T-03, Implement session-update dispatch
  - Origem no legado: `acp-client.ts:1051`; `flowcharts/services.md` §2
  - Critério de pronto: route all sessionUpdate kinds; tool-call extracts files + diff stats + lang
  - Confiança: 🟢

- [ ] T-04, Implement session manager keys + exit handling
  - Origem no legado: `acp-session-manager.ts:84,156,387-398`; `flowcharts/services.md` §1
  - Critério de pronto: one client per (providerId,cwd); exit rejects waiters + clears sessions (R-X-5)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Concurrent ensureStarted coalesce (RF-01)
- [ ] TT-02, sendPrompt creates a session on demand (RF-03)
- [ ] TT-03, once: session deleted post-turn (RF-05)
- [ ] TT-04, Process exit rejects waiters (RF-06)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04.

## Lacunas Pendentes (🔴)

None.
