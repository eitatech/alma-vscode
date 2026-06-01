# bridge-lifecycle (use-case)

> Use-case under `webview-agent-chat`. Mount → ready → render + outgoing actions.
> Source: `index.tsx`, `use-session-bridge.ts`, `flowcharts/webview-agent-chat.md` §1,§3.

## Visão Geral

On mount, the feature reads its surface + session id from the DOM, creates the reducer store, announces `agent-chat/ready`, subscribes to host messages, and renders a decision tree based on `ready` + session-bound state. Outgoing user actions are posted over the bridge (most short-circuit without an active session). 🟢

## Responsabilidades

- Read `data-surface` (sidebar/panel) + `data-session-id` (ignoring `unknown-session`). 🟢
- `useSessionBridge` → `useReducer(INITIAL_STATE)` → post `agent-chat/ready` → listen. 🟢
- Render: not ready → "Loading session…"; bound → transcript+input; sidebar unbound → list+composer; panel unbound → fallback. 🟢
- Post outgoing actions (submit/cancel/retry/change-*/switch/new/pending-writes/permission/probe). 🟢

## Regras de Negócio

- Panel `initialSessionId` from DOM; sidebar `undefined`. 🟢 `flowcharts/webview-agent-chat.md` §1
- Outgoing actions short-circuit without `activeSessionId` (except sidebar-only switch/new/request/pending-write/permission/probe). 🟢 `use-session-bridge.ts:508-674`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Surface/session detection | Must | DOM attrs read; `unknown-session` → undefined |
| RF-02 | Ready handshake | Must | `agent-chat/ready` posted on mount; listener registered |
| RF-03 | Render decision tree | Must | loading / bound / sidebar-unbound / panel-fallback |
| RF-04 | Outgoing actions | Must | each action posts the correct `agent-chat/*` message; scoped |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Actions guarded by active-session presence | `use-session-bridge.ts:508` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o painel montado com data-session-id
Quando o feature inicializa
Então agent-chat/ready é postado e o listener é registrado (RF-02)

Dado nenhuma sessão ativa
Quando submit é acionado
Então a ação faz short-circuit (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-04) | Must | The bridge bootstrap + action surface |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `index.tsx` | `AgentChatFeature` (34), `readSurfaceFromDom`/`readSessionIdFromDom` | 🟢 |
| `use-session-bridge.ts` | `useSessionBridge` (480), outgoing actions (508-674) | 🟢 |
