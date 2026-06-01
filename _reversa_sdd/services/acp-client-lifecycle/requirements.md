# acp-client-lifecycle (use-case)

> Use-case under `services`. Spawn + drive an ACP CLI agent over stdio JSON-RPC, route session-updates.
> Source: `acp/acp-client.ts`, `acp/acp-session-manager.ts`, `flowcharts/services.md` §1–§2.

## Visão Geral

Manages the ACP client subprocess lifecycle (`idle → starting → connected → disposed/exited`), creating sessions on demand, sending prompts via the SDK connection, and routing `sessionUpdate` events to the per-session event bus. One client per `(providerId, cwd)`. 🟢

## Responsabilidades

- `ensureStarted`: spawn the CLI, build `ndJsonStream` + `ClientSideConnection`, `initialize(PROTOCOL_VERSION)`; coalesce concurrent starts. 🟢
- `sendPrompt`: create session on demand (`newSession`), capture model state, `connection.prompt`. 🟢
- Route `sessionUpdate` kinds to chunk/plan/commands/meta/tool-call events. 🟢
- Delete `once:` sessions after the turn; on process exit reject waiters + clear sessions. 🟢

## Regras de Negócio

- **R-X-5** One client per `(providerId, cwd)`; session keys `_ws_` / `spec:<id>` / `once:<uuid>`. 🟢 `acp-session-manager.ts:84,387-398`
- `once:` sessions deleted after the turn / on cancel. 🟢 `acp-client.ts:483,512`
- `initialize` advertises fs capabilities `{readTextFile, writeTextFile}`; guarded by a startup timeout. 🟢 `acp-client.ts:628,655`
- Process exit/error rejects all pending waiters + clears sessions. 🟢 `flowcharts/services.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Start coalescing | Must | concurrent `ensureStarted` share one start promise |
| RF-02 | Spawn + initialize | Must | CLI spawned; `ClientSideConnection.initialize(PROTOCOL_VERSION)`; timeout → kill + idle |
| RF-03 | Send prompt | Must | session created on demand; `connection.prompt`; await stopReason |
| RF-04 | Session-update routing | Must | chunk/plan/commands/meta/tool-call routed to events |
| RF-05 | once: cleanup | Should | single-shot session deleted after the turn |
| RF-06 | Process exit handling | Must | exit/error rejects waiters + clears sessions |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Startup-timeout race fails fast on stuck initialize | `acp-client.ts` (`withStartupTimeout`) | 🟢 |
| Isolamento | One subprocess per (providerId, cwd) for worktree isolation | `acp-session-manager.ts:84` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado nenhuma conexão ativa
Quando dois callers chamam ensureStarted simultaneamente
Então ambos aguardam a mesma startingPromise (RF-01)

Dado um prompt sem sessão existente
Quando sendPrompt é chamado
Então uma sessão é criada (newSession) e connection.prompt é emitido (RF-03)

Dado o processo do agente sair
Quando o exit ocorre
Então todos os waiters pendentes são rejeitados e as sessões limpas (RF-06)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Lifecycle + send + routing + exit (RF-01–RF-04, RF-06) | Must | The ACP runtime spine |
| once: cleanup (RF-05) | Should | Resource hygiene |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `acp/acp-client.ts` | `ensureStarted` (433), `start` (555), `sendPrompt` (453), `createSession` (706), `dispatchSessionUpdate` (1051) | 🟢 |
| `acp/acp-session-manager.ts` | `send` (156), `sendPromptDirect` (173) | 🟢 |
