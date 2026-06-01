# input-submit-delivery (use-case)

> Use-case under `panels`. Optimistic user-message submit + delivery lifecycle in the Agent Chat panel.
> Source: `agent-chat-panel.ts`, `flowcharts/panels.md` §3.

## Visão Geral

Handles a webview `input/submit`: appends an optimistic `pending` user message, then forwards to the runner — patching the message to `delivered` on success or `rejected` (with a reason) for cloud/terminal/no-runner/no-follow-up cases or a thrown error. 🟢

## Responsabilidades

- Build a pending `UserChatMessage` and append optimistically. 🟢
- Reject for cloud (read-only), terminal lifecycle, or no/incapable runner. 🟢
- `runner.submit(content)` → patch `delivered` or `rejected: error.message`. 🟢

## Regras de Negócio

- **R-AC-3** Cloud → reject `read-only`; terminal (`TERMINAL_STATES`) → reject. 🟢 `agent-chat-panel.ts:404-420`
- No runner / runner lacks `submit` → reject. 🟢 `agent-chat-panel.ts:422-445`
- Optimistic pending message has sequence 0 (store re-numbers on read). 🟢 `flowcharts/panels.md` §3

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Optimistic append | Must | pending `UserChatMessage` posted via `messages/appended` |
| RF-02 | Cloud rejection | Must | source cloud → patch `rejected: read-only` (R-AC-3) |
| RF-03 | Terminal rejection | Must | terminal lifecycle → patch `rejected: terminal` (R-AC-3) |
| RF-04 | No-runner rejection | Must | no runner / no `submit` → patch `rejected` |
| RF-05 | Submit + patch | Must | `runner.submit` ok → `delivered`; throw → `rejected: error.message` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Responsividade | Optimistic append shows the message immediately | `flowcharts/panels.md` §3 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão local com runner
Quando input/submit chega
Então a mensagem é anexada pending e, após runner.submit, marcada delivered

Dado uma sessão terminal
Quando input/submit chega
Então a mensagem é marcada rejected: terminal state (R-AC-3)

Dado runner.submit que lança
Quando o envio falha
Então a mensagem é marcada rejected com a mensagem do erro
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-05) | Must | The submit path + its safety rejections |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-panel.ts` | `handleInputSubmit` (382,404-445) | 🟢 |
