# aggregate-snapshot (use-case)

> Use-case under `orchestration`. The read-model that merges all sessions into one bucketed snapshot.
> Source: `orchestration-read-model.ts`, `flowcharts/orchestration.md` §1–§2.

## Visão Geral

Builds an `OrchestrationSnapshot` by collecting agent-chat (active + recent, registry wins over store) and cloud sessions, projecting each to a unified shape, bucketing (`active/waiting/completed/failed`), and sorting by bucket rank then recency — degrading gracefully when upstream wiring is missing. 🟢

## Responsabilidades

- Collect agent-chat sessions (`listActive` + `listRecent`, registry overrides store by id). 🟢
- Collect cloud sessions if `cloudSessionStorage` present; else push a `degradedReason`. 🟢
- Project each session to `OrchestrationSessionProjection` (title, bucket, blocked, target label, open command). 🟢
- Sort by bucket rank then `lastVisibleActivityAt` desc. 🟢

## Regras de Negócio

- **R-OR-1** Merge agent-chat (registry wins) + cloud; sort by bucket rank then recency. 🟢 `orchestration-read-model.ts:136-142,441`
- **R-OR-2** Missing cloud wiring/read failure → `degradedReasons`, no throw. 🟢 `:189,211,233`
- Bucket rank: active(0) → waiting(1) → completed(2) → failed(3). 🟢 `:451-461`
- agent-chat title from first user message, else `agentDisplayName (mode)`; `waiting-for-input` ⇒ blocked. 🟢 `:350-362`
- Bucket maps: agent-chat `waiting-for-input→waiting`, `completed→completed`, `failed/cancelled/ended-by-shutdown→failed`, else `active`; cloud `BLOCKED→waiting`, `COMPLETED→completed`, `FAILED/CANCELLED→failed`, else `active`. 🟢 `flowcharts/orchestration.md` §2

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Collect agent-chat | Must | active+recent merged; registry overrides store by id; read failure → degradedReason + empty |
| RF-02 | Collect cloud | Must | only if storage present; read failure → degradedReason |
| RF-03 | Unified projection | Must | each session → `OrchestrationSessionProjection` with correct bucket + open command |
| RF-04 | Sort | Must | bucket rank asc, then `lastVisibleActivityAt` desc |
| RF-05 | Provider summary | Should | `activeProvider` + `cloudProviderCount` populated |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | All read failures degrade to reasons, never throw | `orchestration-read-model.ts:189` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado sessões em ambas as fontes com uma sessão presente em registry e store
Quando snapshot é montado
Então a versão do registry prevalece e a ordenação segue bucket rank + recência (R-OR-1)

Dado cloudSessionStorage ausente
Quando snapshot roda
Então uma degradedReason de cloud é registrada e o snapshot retorna sem cloud (R-OR-2)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Collect + project + sort + degrade (RF-01–RF-04) | Must | The entire dashboard read-model |
| Provider summary (RF-05) | Should | UI metadata |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `orchestration-read-model.ts` | `snapshot` (129), `collectAgentChatSessions` (178), `collectCloudSessions` (207), `toAgentChatProjection`/`toCloudProjection` (283/313), `bucketFor*`/`compareSessions` (397/416/441) | 🟢 |
