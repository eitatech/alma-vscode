# aggregate-snapshot, Design Técnico

> HOW the read-model builds a snapshot. Source: `orchestration-read-model.ts` (462), `flowcharts/orchestration.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `OrchestrationReadModel.snapshot` | `()` | `Promise<OrchestrationSnapshot>` | `:129` |
| `collectAgentChatSessions` / `collectCloudSessions` | `()` | projections + degradation | `:178/207` |
| `toAgentChatProjection` / `toCloudProjection` | `(session)` | `OrchestrationSessionProjection` | `:283/313` |
| `bucketForAgentChat` / `bucketForCloud` / `compareSessions` | bucketing + sort | bucket / order | `:397/416/441` |

## Fluxo Principal

1. `collectAgentChatSessions`: `store.listActive + listRecent`; on read failure → push degradedReason + return empty; else merge by id (registry active/recent overrides store) → `toAgentChatProjection`. 🟢
2. `collectCloudSessions`: if no `cloudSessionStorage` → degradedReason + empty; else `getAll`; read failure → degradedReason; else `toCloudProjection`. 🟢
3. Concat sessions; sort by bucket rank then `lastVisibleActivityAt` desc. 🟢
4. Read `activeProvider` + `cloudProviderCount`. 🟢
5. Return `OrchestrationSnapshot` with `degradedReasons`. 🟢

## Bucket projection (§2)

| Source | Lifecycle/status | Bucket |
|--------|------------------|--------|
| agent-chat | `waiting-for-input` | waiting |
| agent-chat | `completed` | completed |
| agent-chat | `failed`/`cancelled`/`ended-by-shutdown` | failed |
| agent-chat | else (`initializing`/`running`) | active |
| cloud | `BLOCKED` | waiting |
| cloud | `COMPLETED` | completed |
| cloud | `FAILED`/`CANCELLED` | failed |
| cloud | else (`PENDING`/`RUNNING`) | active |

## Fluxos Alternativos

- **Both sources empty/unreadable:** snapshot returns empty sessions + the degradedReasons explaining why. 🟢

## Dependências

- `agent-chat` registry + store; `cloud-agents` storage + provider registry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Registry-wins-over-store de-dup by id | `:136` | 🟢 |
| `lastVisibleActivityAt` = max of updates + transcript timestamps | `:380` (data-dictionary) | 🟢 |

## Estado Interno

Stateless projection; reads upstream stores each call. 🟢

## Observabilidade

`degradedReasons` is the diagnostic surface for missing wiring. 🟢

## Riscos e Lacunas

- 🟡 Title derivation depends on transcript availability; cloud titles fall back to task/spec path.
