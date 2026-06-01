# cloud-agent-progress-panel, Design Técnico

> HOW the progress panel works. Source: `cloud-agent-progress-panel.ts` (184), `cloud-agent-message-handler.ts` (74), `flowcharts/panels.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CloudAgentProgressPanel.sendSessionData` | `()` | void | project + post — `:107` |
| `CloudAgentMessageHandler` | message router | — | refresh/open-external/open-pr |

## Fluxo Principal (§5)

1. show / `refresh-status` → `registry.getActive` + `sessionStorage.getAll`. 🟢
2. map `AgentSession` → DTO: `displayStatus = active?.getStatusDisplay(s) ?? s.status`; tasks → `{taskId, specTaskId, title, priority, status}`; PRs → `{url, state||'open', branch}`. 🟢
3. `postMessage('session-update', {sessions, activeProvider})`. 🟢

## Dependências

- `cloud-agents` (`AgentSessionStorage`, `ProviderRegistry`, types, `logging`). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Provider-derived display status (delegation) | `cloud-agent-progress-panel.ts:119` | 🟢 |
| Replaces the Devin-specific panel (spec 016) | code-analysis note | 🟢 |

## Estado Interno

The panel + last projected sessions. 🟢

## Observabilidade

`cloud-agents/logging`. 🟡

## Riscos e Lacunas

- 🟡 The legacy `devin-progress-panel` still exists alongside this (possibly dormant — see `../questions.md`).
