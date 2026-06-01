# register-chat-participants (use-case)

> Use-case under `agents`. Discovery → registration → chat-request handling.
> Source: `agent-loader.ts`, `chat-participant-registry.ts`, `flowcharts/agents.md` §1.

## Visão Geral

Discovers `.agent.md` definitions, validates them, registers each valid one as a GitHub Copilot chat participant, and handles incoming `@agent /command args` requests by resolving the command and dispatching to its tool. 🟢

## Responsabilidades

- Skip registration gracefully when the Copilot Chat API is unavailable. 🟢
- Load + validate definitions, auto-injecting `/help`. 🟢
- Register chat participants (icon + followups), avoiding duplicate registration. 🟢
- Parse `@agent /command` requests, load resources, and execute the bound tool, rendering response or formatted error. 🟢

## Regras de Negócio

- **R-AC-10** id kebab-case, ≥1 command, `/help` auto-injected, unique tool names. 🟢 `agent-loader.ts:262`; `tool-registry.ts:47`
- A command not found in the agent renders a not-found/help message (not an exception). 🟢 `chat-participant-registry.ts:147`
- An already-registered agent is not re-registered. 🟢 `flowcharts/agents.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Chat-API availability gate | Must | If `vscode` Chat API missing → log + skip, no throw |
| RF-02 | Load + validate definitions | Must | Valid `AgentDefinition[]` produced; invalid skipped + logged |
| RF-03 | Register participants | Must | One chat participant per valid agent; icon + followups set; no duplicates |
| RF-04 | Handle chat request | Must | `@agent /cmd args` resolves the command, loads resources, runs the tool, streams output |
| RF-05 | Unknown command handling | Should | Renders not-found/help, no exception |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Missing Chat API and invalid agents degrade gracefully | `flowcharts/agents.md` §1; `agent-loader.ts:243` | 🟢 |
| Observabilidade | Errors rendered with guidance + technical details + telemetry | `chat-participant-registry.ts`; `error-formatter.ts:294` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado a Chat API do Copilot disponível e um diretório com .agent.md válidos
Quando o registro roda
Então cada agente válido vira um chat participant e os inválidos são logados e ignorados

Dado um chat participant registrado
Quando o usuário envia "@agent /cmd args"
Então o comando é resolvido, os recursos são carregados e o tool é executado, com a resposta transmitida

Dado um comando inexistente
Quando o usuário o invoca
Então uma mensagem de não-encontrado/help é renderizada sem exceção
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Load/validate/register/route (RF-02, RF-03, RF-04) | Must | The end-to-end participation path |
| API gate (RF-01) | Must | Avoids activation failure |
| Unknown command (RF-05) | Should | UX robustness |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-loader.ts` | `loadAgents` (26), `validateDefinition` (243) | 🟢 |
| `chat-participant-registry.ts` | `registerAgent` (71), `handleChatRequest` (147) | 🟢 |
| `tools/help-handler.ts`, `tools/help-formatter.ts` | `/help` rendering | 🟢 |
