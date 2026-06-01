# chat-routing-dispatch (use-case)

> Use-case under `services`. Decide ACP vs Copilot Chat and dispatch (with slash-rewrite + fallback).
> Source: `chat-router.ts`, `chat-dispatcher.ts`, `flowcharts/services.md` §5.

## Visão Geral

Resolves the chat target (ACP provider or Copilot Chat) from config override → remote-workspace check → host/probe auto-detection (cached 60 s), then dispatches: for ACP it rewrites a leading `/command` into natural language and sends via the session manager; on failure it falls back to Copilot Chat. 🟢

## Responsabilidades

- `ChatRouter.resolve`: decide target (cached 60 s). 🟢
- For ACP: probe descriptor (installed → acpSupported → authenticated); schedule onboarding when needed. 🟢
- Dispatch: ACP → `rewritePromptForAcp` → `sessionManager.send`; throw → invalidate + Copilot fallback. 🟢
- Copilot: `workbench.action.chat.open` (with `files?` on VS Code ≥ 1.95.0). 🟢

## Regras de Negócio

- Routing: `gatomia.chat.provider` override; ACP disabled in remote workspaces; auto by host + probe. 🟢 `chat-router.ts:71-108`
- Decision cached 60 s. 🟢 `chat-router.ts:159`
- **R-X-4** ACP dispatch rewrites a leading `/command` into natural language. 🟢 `chat-dispatcher.ts:38-61`
- **R-X-2** Copilot `files` param only on VS Code ≥ 1.95.0. 🟢 `chat-dispatcher.ts:126-138`
- Probe: installed? no → schedule onboarding install → Copilot; acpSupported? no → Copilot; authenticated? no → schedule onboarding auth → Copilot; else → ACP. 🟢 `flowcharts/services.md` §5

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Config override | Must | `copilot-chat` → Copilot; non-auto provider registered? else Copilot |
| RF-02 | Remote-workspace off | Must | remote workspace → Copilot (ACP disabled) |
| RF-03 | Auto probe | Must | host → registry.forHost → probe chain → {acp, copilot-chat} |
| RF-04 | 60 s cache | Should | decision cached for 60 s |
| RF-05 | Slash rewrite | Must | leading `/cmd` → natural language for ACP (R-X-4) |
| RF-06 | Fallback | Must | ACP send throw → invalidate cache → Copilot |
| RF-07 | Files param gate | Should | `files` only on VS Code ≥ 1.95.0 (R-X-2) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Graceful Copilot fallback on any ACP failure | `chat-dispatcher.ts:83` | 🟢 |
| Performance | 60 s routing cache avoids repeated host probes | `chat-router.ts:159` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um workspace remoto
Quando a rota é resolvida (auto)
Então o alvo é Copilot Chat (ACP desabilitado) (R-X... remote)

Dado ACP autenticado e um prompt "/speckit.plan ..."
Quando despachado
Então o /comando é reescrito e enviado via sessionManager.send (R-X-4)

Dado ACP que lança no envio
Quando o dispatch falha
Então o cache é invalidado e o Copilot Chat assume (RF-06)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Resolve + dispatch + rewrite + fallback (RF-01–RF-06) | Must | The chat entry point |
| Files-param gate (RF-07) | Should | Version compatibility |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `chat-router.ts` | `resolve` (51), `decide` (71-108), cache (159) | 🟢 |
| `chat-dispatcher.ts` | `dispatch` (83), `rewritePromptForAcp` (38), files gate (126-138) | 🟢 |
