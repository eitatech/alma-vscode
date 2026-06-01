# webview-agent-chat (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA).
> Source: `ui/src/features/agent-chat/` (~4,541 LOC, 25 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-agent-chat` is the React webview for the Agent Chat Panel — the client half of the extension-side `agent-chat`. It renders two surfaces (canonical **sidebar** + legacy **panel**) from one tree, holds all chat state in a single `useReducer` store, and drives the host exclusively over the `postMessage` bridge. Owns transcript rendering, the follow-up `InputBar`, the empty-state `NewSessionComposer`, session switching, the pending file-write Accept/Reject bar, and model/mode/thinking/role/permission chips. 🟢

## Responsabilidades

- Detect surface (`data-surface`) + session id (`data-session-id`) from the root DOM. 🟢
- Maintain a single `useReducer` bridge store; translate incoming postMessages → actions. 🟢
- Send outgoing control/input actions over the bridge. 🟢
- Render transcript, input bar, composer, chips, pending-writes bar against host state. 🟢

## Regras de Negócio

- **R-X-6** Webview MUST NOT import from `src/`; `types.ts` is the contract mirror, updated in lockstep. 🟢 `types.ts:11`
- Appended messages `Set`-deduped by `id` (idempotent re-delivery). 🟢 `use-session-bridge.ts:212`
- Panel surface ignores `session/loaded` whose `session.id != initialSessionId`. 🟢 `use-session-bridge.ts:337`
- Active-session scoping: messages/lifecycle/models/pending-writes dropped when `sessionId != activeSessionId`. 🟢 `use-session-bridge.ts:347-418`
- `permission-default/changed` only accepts `ask`/`allow`/`deny`. 🟢 `use-session-bridge.ts:428`
- InputBar disabled by precedence: `readOnly` → `!acceptsFollowUp` → `terminal`. 🟢 `input-bar.tsx:121,259`
- Enter submits, Shift+Enter newlines; submit needs non-empty trimmed value. 🟢 `input-bar.tsx:130,153`
- Composer default provider = first `enabled`; `canSubmit` = providerId set AND non-empty prompt. 🟢 `new-session-composer.tsx:92,233`
- Switching provider resets model/thinking/role, keeps agent file, re-probes models. 🟢 `new-session-composer.tsx:129,195`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Surface + session detection | Must | `data-surface`/`data-session-id` read; `unknown-session` ignored |
| RF-02 | Bridge store | Must | single `useReducer`; ready gate; render decision tree |
| RF-03 | Incoming routing | Must | `type → INCOMING_HANDLERS` → scoped dispatch |
| RF-04 | Outgoing actions | Must | submit/cancel/retry/change-*/switch/new/pending-writes/permission/probe |
| RF-05 | InputBar gating | Must | precedence readOnly → !acceptsFollowUp → terminal (R-X) |
| RF-06 | Composer gating | Must | first-enabled default; canSubmit; provider-switch reset |
| RF-07 | Contract mirror | Must | no `src/` imports; `types.ts` mirrors extension types (R-X-6) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Idempotência | Set-dedup of appended messages tolerates re-delivery | `use-session-bridge.ts:212` | 🟢 |
| Isolamento | Webview talks to host only via postMessage; no `src/` coupling | `types.ts:11` | 🟢 (R-X-6) |
| Manutenibilidade | INCOMING_HANDLERS keeps the hook under the complexity ceiling | `use-session-bridge.ts:296` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o sidebar montado sem sessão vinculada
Quando ready=true
Então SessionsList + NewSessionComposer são renderizados (RF-02)

Dado uma mensagem appended re-entregue com o mesmo id
Quando processada
Então ela é deduplicada (Set por id) (RF-03)

Dado uma sessão cloud (readOnly)
Quando o InputBar renderiza
Então ele fica desabilitado com "read-only cloud session" (RF-05)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Detection + store + routing + actions + gating + mirror (RF-01–RF-07) | Must | The whole chat UI |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hooks/use-session-bridge.ts` | `useSessionBridge` (480), `reducer` (194), `translateIncoming` (296), `applyPatch` (447) | 🟢 |
| `index.tsx` | `AgentChatFeature` (34) | 🟢 |
| `components/input-bar.tsx` | `InputBar` (94), `resolveDisabledReason` (259), `ModelChip` (300) | 🟢 |
| `components/new-session-composer.tsx` | `NewSessionComposer` (83) | 🟢 |
| `types.ts` | contract mirror | 🟢 |
