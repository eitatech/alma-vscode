# cloud-agent-progress-panel (use-case)

> Use-case under `panels`. Provider-agnostic cloud-agent session-progress panel.
> Source: `cloud-agent-progress-panel.ts`, `cloud-agent-message-handler.ts`, `flowcharts/panels.md` §5.

## Visão Geral

Projects the persisted `AgentSession[]` (status/branch/tasks/PRs) from `AgentSessionStorage` + the active `ProviderRegistry` into a webview `session-update`, using the active provider's status display. Replaces the Devin-specific panel (spec 016). 🟢

## Responsabilidades

- On show/refresh, read active provider + all sessions. 🟢
- Map each `AgentSession` → view DTO (display status, tasks, PRs default `state:'open'`). 🟢
- Post `session-update {sessions, activeProvider}`. 🟢
- Route inbound messages (refresh-status, open-external, open-pr). 🟢

## Regras de Negócio

- `displayStatus` from the active provider's `getStatusDisplay(session)`, fallback raw status. 🟢 `cloud-agent-progress-panel.ts:119`
- PRs projected with default `state:'open'` when undefined. 🟢 `flowcharts/panels.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Session projection | Should | sessions → DTO (tasks, PRs, display status) |
| RF-02 | Display status | Should | active provider `getStatusDisplay`, fallback raw |
| RF-03 | Post update | Should | `session-update {sessions, activeProvider}` posted |
| RF-04 | Message routing | Should | refresh-status / open-external / open-pr handled |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Provider-agnosticism | Display logic delegated to the active provider | `cloud-agent-progress-panel.ts:119` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado sessões persistidas e um provider ativo
Quando o painel é mostrado/atualizado
Então cada sessão é projetada com displayStatus do provider e postada via session-update

Dado um PR sem state definido
Quando projetado
Então recebe state 'open' por padrão
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Projection + post + routing (RF-01–RF-04) | Should | Progress visibility (provider-agnostic) |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `cloud-agent-progress-panel.ts` | `sendSessionData` (107), displayStatus (119) | 🟢 |
| `cloud-agent-message-handler.ts` | refresh/open-external/open-pr router | 🟢 |
