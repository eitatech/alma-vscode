# message-reducer-routing (use-case)

> Use-case under `webview-agent-chat`. Incoming postMessage → reducer action routing + session scoping.
> Source: `use-session-bridge.ts`, `flowcharts/webview-agent-chat.md` §2.

## Visão Geral

Translates incoming `agent-chat/*` host messages into typed `BridgeAction`s via an `INCOMING_HANDLERS` table, applies session-id scoping before dispatch, and reduces them into the bridge state — with idempotent message append and per-variant patching. 🟢

## Responsabilidades

- Map `type → INCOMING_HANDLERS[type]` → typed `BridgeAction` (or undefined). 🟢
- Apply session-id scope before dispatch. 🟢
- Reduce: `session/loaded` (replace transcript), `messages/appended` (Set-dedup), `messages/updated` (applyPatch), lifecycle/cleared/catalog/models/list/pending-writes/permission. 🟢

## Regras de Negócio

- `messages/*`, `lifecycle-changed`, `models-changed`, `pending-writes/changed` dropped when `payload.sessionId != activeSessionId`. 🟢 `use-session-bridge.ts:347-418`
- Panel `session/loaded` dropped when `session.id != initialSessionId`. 🟢 `use-session-bridge.ts:337`
- `messages/appended` Set-deduped by id. 🟢 `use-session-bridge.ts:212`
- `permission-default/changed` only `ask`/`allow`/`deny`. 🟢 `use-session-bridge.ts:428`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Handler table | Must | each `agent-chat/*` type maps to a `BridgeAction` or undefined |
| RF-02 | Session scoping | Must | mismatched-session messages dropped (R-X scoping) |
| RF-03 | Idempotent append | Must | duplicate-id appended messages deduped |
| RF-04 | Per-variant patch | Must | `messages/updated` patches without widening the union |
| RF-05 | Permission filter | Should | only ask/allow/deny accepted |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Manutenibilidade | Handler table keeps the hook under the complexity ceiling | `use-session-bridge.ts:296` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma mensagem com sessionId != activeSessionId
Quando recebida
Então é descartada antes do dispatch (RF-02)

Dado dois messages/appended com o mesmo id
Quando reduzidos
Então apenas um permanece no transcript (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Table + scoping + dedup + patch (RF-01–RF-04) | Must | The state-sync correctness |
| Permission filter (RF-05) | Should | Input sanitization |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `use-session-bridge.ts` | `translateIncoming` (296), `INCOMING_HANDLERS` (322-440), `reducer` (194-286), `applyPatch` (447) | 🟢 |
