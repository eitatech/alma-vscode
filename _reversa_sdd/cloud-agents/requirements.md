# cloud-agents (module)

> Module-level `requirements.md`. Bounded context: **Cloud Delegation**.
> Source: `src/features/cloud-agents/` (~2,611 LOC, 11 source files). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`cloud-agents` is the **provider-agnostic** cloud-agent integration. It abstracts **Devin** (REST) and the **GitHub Copilot coding agent** (GraphQL issues + PR timeline) behind a single `CloudAgentProvider` interface. It owns unified polling (grace periods + backoff), normalized session/task/PR state, credential gating, a provider registry, legacy-Devin migration, and 7-day session cleanup. Session updates are bridged to `agent-chat` (spec 018). 🟢

## Responsabilidades

- Expose a single `CloudAgentProvider` contract implemented by per-provider adapters. 🟢
- Create cloud sessions from a spec task + context, persisting them to `workspaceState`. 🟢
- Poll active/grace sessions, map provider responses to `SessionUpdate`s, normalize terminal state. 🟢
- Gate on credentials; stop polling after repeated failures; surface credential expiry. 🟢
- Maintain the provider registry (register/activate/restore) and migrate legacy Devin config. 🟢
- Clean up sessions after a 7-day retention window. 🟢

## Regras de Negócio

- **R-CD-4** Polling stops after **3 consecutive failures**; a credential-expiry callback fires (FR-020). 🟢 `agent-polling-service.ts:50,306`
- **R-CD-5** Grace window after sessions reach terminal — open-PR grace **5 min** (known) / **1 h** (unknown); terminal PRs excluded; terminal sessions update PR data only. 🟢 `agent-polling-service.ts:51,217`
- **R-CD-6** Terminal normalization: non-terminal tasks derived from session status (else `SKIPPED`); an undefined PR state becomes `merged` if `COMPLETED`, else `open`. 🟢 `agent-polling-service.ts:346`; `agent-session-storage.ts:248`
- **R-CD-7** **7-day retention**: completed sessions cleaned up 7 days after completion. 🟢 `session-cleanup-service.ts:18,40`
- **R-CD-8** When a provider becomes inactive, its sessions become `isReadOnly` and are excluded from polling and from being the active session. 🟢 `agent-session-storage.ts:167`; `agent-polling-service.ts:212`
- Active provider comes from the registry; none → polling skipped; a provider must be registered before activation. 🟢 `provider-registry.ts:72,83`
- Legacy-Devin auto-migration; orphaned active-provider config cleared (FR-021). 🟢 `migration-service.ts:65,90`
- PR reconciliation matches by URL and preserves `createdAt`; updates are idempotent. 🟢 `agent-session-storage.ts:149`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Provider-agnostic create | Must | `createSession(task, ctx)` via the active provider returns an `AgentSession{status:PENDING}` |
| RF-02 | Unified polling with grace + backoff | Must | `pollOnce` polls active+grace sessions; stops after 3 failures (R-CD-4) |
| RF-03 | Terminal normalization | Must | Terminal sessions derive task statuses and infer PR states (R-CD-6) |
| RF-04 | Credential gating + expiry callback | Must | Missing credentials block create/poll; expiry fires `onCredentialExpiry` |
| RF-05 | Provider registry | Must | Register → activate → restore; no active provider → polling skipped |
| RF-06 | Inactive-provider read-only | Should | Sessions of an inactive provider become `isReadOnly`, excluded from polling (R-CD-8) |
| RF-07 | Legacy migration | Should | Legacy Devin config auto-migrates; orphaned active provider cleared (R-CD-8/FR-021) |
| RF-08 | 7-day cleanup | Should | Sessions older than `now - 7d` (by completion) are deleted; count returned (R-CD-7) |
| RF-09 | agent-chat bridge | Should | `onSessionUpdated` fires for the `chatPanelId`-linked session (spec 018) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Backoff + 3-failure stop + credential-expiry callback prevent runaway polling | `agent-polling-service.ts:50,306` | 🟢 |
| Confiabilidade | Load-time validation + normalization repairs stale persisted state | `agent-session-storage.ts:248` | 🟢 |
| Segurança | Credentials in `SecretStorage`; gating before create/poll | `agent-session-storage.ts`; `agent-polling-service.ts:50` | 🟢 |
| Escalabilidade | Grace-period filtering limits the polled set; 7-day cleanup bounds storage | `agent-polling-service.ts:51`; `session-cleanup-service.ts:18` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um provider ativo com credenciais válidas
Quando uma task é despachada para a nuvem
Então uma AgentSession é criada em PENDING e persistida, e onUpdated é disparado

Dado uma sessão que atingiu estado terminal com PR de estado desconhecido
Quando a normalização roda
Então tasks não-terminais viram SKIPPED e o PR vira merged (se COMPLETED) senão open (R-CD-6)

Dado 3 falhas consecutivas de polling
Quando o poll falha pela terceira vez
Então o intervalo de polling é interrompido (R-CD-4)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Create + poll + normalize (RF-01, RF-02, RF-03) | Must | Core delegation loop |
| Credential gating (RF-04) | Must | Required to call provider APIs |
| Registry (RF-05) | Must | Selects the active provider |
| Read-only / migration / cleanup / bridge (RF-06–RF-09) | Should | Robustness + lifecycle hygiene |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `cloud-agent-provider.ts` | `CloudAgentProvider` interface | 🟢 |
| `adapters/devin-adapter.ts` | `DevinAdapter` (create/poll/map) | 🟢 |
| `adapters/github-copilot-adapter.ts` | `GitHubCopilotAdapter` | 🟢 |
| `agent-polling-service.ts` | `pollOnce` (154), `getSessionsToPoll` (217), `applyUpdate` (255), `deriveTerminalTaskStatuses` (346) | 🟢 |
| `agent-session-storage.ts` | `getActive` (88), `normalizeSession` (248) | 🟢 |
| `provider-registry.ts` | `setActive` (83), `restoreActive` (107) | 🟢 |
| `migration-service.ts` | `migrateIfNeeded` (65) | 🟢 |
| `session-cleanup-service.ts` | `cleanup` (40) | 🟢 |

> See `contracts.md` for the provider interface contract and `questions.md` for the 🔴 Devin ownership-overlap gap.
