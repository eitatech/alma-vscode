# start-new-session (use-case)

> Use-case under `commands`. `gatomia.agentChat.startNew` + the tier-grouped new-session QuickPick.
> Source: `agent-chat-commands.ts`, `agent-chat-new-session.ts`, `flowcharts/commands.md` §1,§6.

## Visão Geral

Starts a new Agent Chat session: enforce the concurrent cap, start the ACP session, register it, attach the runner, create the panel, and (as the single source of truth) attach the panel. The `newSession` QuickPick gathers the agent (tier-grouped) + task before calling startNew. 🟢

## Responsabilidades

- `enforceConcurrentCap`: checkCapacity → prompt (abort / cancel-and-start / cancel-only); fail closed without a prompt helper. 🟢
- Start ACP session → register → attachRunner → createPanel → **attachPanel** → reveal. 🟢
- QuickPick: bucket providers by tier; install-required opens the URL; else task prompt → startNew. 🟢

## Regras de Negócio

- **R-AC-11** `handleStartNew` owns `attachPanel` (panel never self-registers). 🟢 `agent-chat-commands.ts:221-226`
- Cap enforcement only when wired; no prompt helper ⇒ abort (fail closed). 🟢 `agent-chat-commands.ts:238-260`
- QuickPick tiers: Installed / Available via npx / Install required; install-required opens URL (no start). 🟢 `agent-chat-new-session.ts:115-165`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Cap enforcement | Must | at cap → prompt; abort stops; cancel-and-start cancels idle then starts; no helper → abort |
| RF-02 | Start + wire + attachPanel | Must | start → register → attachRunner → createPanel → attachPanel → reveal (R-AC-11) |
| RF-03 | Tier QuickPick | Should | providers bucketed; install-required opens URL; else task prompt → startNew |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Cap fails closed without a prompt helper | `agent-chat-commands.ts:238-260` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado capacidade no limite com prompt helper
Quando startNew é chamado e o usuário escolhe cancel-and-start
Então a sessão idle é cancelada e a nova inicia (RF-01)

Dado startNew bem-sucedido
Quando o painel é criado
Então attachPanel é chamado uma única vez no handler (R-AC-11)

Dado um provider install-required na QuickPick
Quando selecionado
Então a URL de instalação abre em vez de iniciar (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cap + start + attachPanel (RF-01, RF-02) | Must | The start path + the invariant |
| QuickPick (RF-03) | Should | Entry UX |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-commands.ts` | `handleStartNew` (207), `enforceConcurrentCap` (234) | 🟢 |
| `agent-chat-new-session.ts` | `handleNewSession` (183), `buildQuickPickItems` (127) | 🟢 |
