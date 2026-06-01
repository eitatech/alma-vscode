# providers (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra**.
> Source: `src/providers/` (~8,774 LOC, 18 source files). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`providers` is the **VS Code UI registration layer** — the bridge between extension services and the workbench. It holds ~10 `TreeDataProvider`s, 4 `WebviewViewProvider`s, 2 webview panels, a `CodeLensProvider`, and a `CopilotProvider` wrapper. Providers hold almost no domain logic: they subscribe to feature-layer events, project state into `TreeItem`s / `postMessage` payloads, and translate user actions back into commands/service calls. The most complex member, `agent-chat-view-provider.ts`, is a full bidirectional bridge with an inner per-session binding. 🟢

## Responsabilidades

- Register sidebar tree views + webview views/panels and their view ids. 🟢
- Project feature-layer state (specs, sessions, hooks, resources) into view models. 🟢
- Bridge the Agent Chat sidebar webview ↔ a single bound session (`SidebarSessionBinding`). 🟢
- Buffer hooks-panel messages until ready; mirror executor status. 🟢
- Run the Welcome screen: dependency detection, config, install dispatch. 🟢

## Regras de Negócio

- **R-AC-11** Exactly one `SidebarSessionBinding` alive; rebinding disposes the prior. 🟢 `agent-chat-view-provider.ts:556-562`
- Chat view declared twice (auxiliary + primary), gated by `gatomia.host.chatInPrimary`; `reveal()` fires both `.focus` (inactive no-ops). 🟢 `agent-chat-view-provider.ts:133-150,297-331`
- **R-AC-3** Cloud sessions read-only; terminal sessions reject follow-up. 🟢 `agent-chat-view-provider.ts:1133,1142`
- Transcript pushed as **append-only deltas** (diff by message id), not full re-renders. 🟢 `agent-chat-view-provider.ts:1264-1276`
- `permissionDefault` writes to **Global** config; a config-change listener rebroadcasts (single source of truth). 🟢 `agent-chat-view-provider.ts:534-550`
- Spec tree refresh debounced **2 s** on `**/specs/**/*.md` + review-flow state changes; grouping from review-flow status (none ⇒ Current). 🟢 `spec-explorer-provider.ts:38,304-329`
- GatomIA-CLI install gated on host prerequisites (windsurf⇒Devin CLI; antigravity⇒Gemini CLI; else Copilot Chat+CLI) **plus** ≥1 spec system. 🟢 `welcome-screen-provider.ts:83-116`
- Hooks-panel messages buffered until `hooks.ready`, then flushed. 🟢 `hook-view-provider.ts:322-323`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Register surfaces | Must | view ids registered: `gatomia.views.{agentChat,agentChatPrimary,specExplorer,orchestration}`, `gatomia.hooksPanel` |
| RF-02 | Agent Chat bridge + binding | Must | resolve → route → bind; one binding at a time (R-AC-11) |
| RF-03 | Read-only / terminal rejection | Must | cloud/terminal session follow-up rejected (R-AC-3) |
| RF-04 | Append-only transcript deltas | Must | only fresh messages posted (diff by id) |
| RF-05 | Spec tree projection | Must | 4 groups by review-flow status; 2 s debounced refresh |
| RF-06 | Hooks panel CRUD + readiness | Must | messages buffered until ready; CRUD/logs/status mirrored |
| RF-07 | Welcome install | Must | per-dependency dispatch; gatomia-cli prereq gate; post-install re-probe |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Transcript delta diffing avoids full re-renders; model probes coalesce | `agent-chat-view-provider.ts:1264,713-726` | 🟢 |
| Responsividade | Spec tree refresh debounced 2 s | `spec-explorer-provider.ts:38` | 🟢 |
| Consistência | `permissionDefault` single source of truth via config listener | `agent-chat-view-provider.ts:534-550` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão já vinculada ao sidebar
Quando o usuário troca para outra sessão
Então o binding anterior é descartado e exatamente um novo binding fica ativo (R-AC-11)

Dado uma sessão cloud vinculada
Quando o usuário envia um follow-up
Então é rejeitado como read-only (R-AC-3)

Dado mudanças em **/specs/**/*.md
Quando ocorrem
Então a árvore de specs atualiza após 2s de debounce
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Surfaces + chat bridge + spec tree + hooks panel + welcome (RF-01–RF-07) | Must | The entire UI surface |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-view-provider.ts` | `resolveWebviewView` (230), `bindSession` (556), `SidebarSessionBinding.*` (980/1111/1264) | 🟢 |
| `spec-explorer-provider.ts` | `getChildren` (268) | 🟢 |
| `hook-view-provider.ts` | `handleWebviewMessage` (401), `initialize` (347) | 🟢 |
| `welcome-screen-provider.ts` | `installDependency` (294) | 🟢 |
| `copilot-provider.ts` | `createTempFile` (47) | 🟢 |
| `running-agents-tree-provider.ts`, `actions/steering/wiki/hooks-explorer`, `*-progress-provider.ts` | tree projections | 🟢 |

> See `questions.md` for dormant scaffold views + the package.json view-wiring gap.
