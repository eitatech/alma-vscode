# agent-chat-sidebar-binding (use-case)

> Use-case under `providers`. The Agent Chat sidebar webview bridge + single-session binding.
> Source: `agent-chat-view-provider.ts`, `flowcharts/providers.md` §1–§2.

## Visão Geral

Resolves the Agent Chat sidebar webview, routes inbound messages, and binds exactly one session at a time via an inner `SidebarSessionBinding` that mirrors transcript/lifecycle/model/pending-write deltas to the webview and forwards follow-up submits to the runner. 🟢

## Responsabilidades

- `resolveWebviewView`: set HTML, wire messages, push catalog/session-list/permission-default. 🟢
- Route control messages (switch/new/permission/probe) and default messages to the binding. 🟢
- Bind a session (dispose any prior binding); cloud sessions render read-only. 🟢
- `SidebarSessionBinding`: send full snapshot, handle submit, flush append-only deltas. 🟢

## Regras de Negócio

- **R-AC-11** One `SidebarSessionBinding` alive; rebinding disposes the prior. 🟢 `agent-chat-view-provider.ts:556-562`
- **R-AC-3** Cloud follow-up rejected (read-only); terminal sessions reject input. 🟢 `:1133,1142`
- Transcript = append-only deltas (diff by id). 🟢 `:1264-1276`
- `permissionDefault` → Global config; listener rebroadcasts. 🟢 `:534-550`
- Dual view focus: `reveal()` fires both `.focus`; inactive no-ops. 🟢 `:297-331`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Resolve + initial push | Must | HTML set; catalog + session list + permission default pushed |
| RF-02 | Message routing | Must | control messages handled; default → binding (if any) |
| RF-03 | Single binding | Must | bind disposes prior; one alive (R-AC-11) |
| RF-04 | Submit handling | Must | non-cloud, non-terminal, runner-attached → `runner.submit`; else reject with reason (R-AC-3) |
| RF-05 | Delta sync | Must | manifest change → lifecycle/model/transcript deltas posted (append-only) |
| RF-06 | Permission default | Should | change writes Global config; listener rebroadcasts |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Append-only delta diffing + model-probe coalescing | `:1264,713-726` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o sidebar resolvido com uma sessão local vinculada
Quando o usuário envia um follow-up
Então runner.submit é chamado e a entrega é marcada delivered (ou rejected on throw)

Dado uma troca de sessão
Quando control/switch-session chega
Então o binding anterior é descartado e o novo é vinculado (R-AC-11)

Dado uma sessão cloud
Quando o usuário envia input
Então a entrega é rejeitada como read-only (R-AC-3)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Resolve + route + bind + submit + delta (RF-01–RF-05) | Must | The chat bridge |
| Permission default (RF-06) | Should | Settings sync |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-view-provider.ts` | `resolveWebviewView` (230), `handleWebviewMessage` (425), `bindSession` (556), `SidebarSessionBinding.sendSessionLoaded` (980), `handleInputSubmit` (1111), `flushTranscriptDeltas` (1264) | 🟢 |
