# chat-routing-dispatch, Design Técnico

> HOW routing + dispatch work. Source: `chat-router.ts` (177), `chat-dispatcher.ts` (158), `flowcharts/services.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `ChatRouter.resolve` / `decide` | `(ctx)` | decision (60 s cache) | `:51/71` |
| `ChatDispatcher.dispatch` | `(prompt, ...)` | route + send | `:83` |
| `rewritePromptForAcp` | `(prompt)` | natural-language | `:38` |

## Routing decision (§5)

1. config `copilot-chat` → Copilot. 🟢
2. config provider != auto → registered? no → Copilot; yes → probe path. 🟢
3. auto + remote workspace → Copilot. 🟢
4. auto → host detect → `registry.forHost` → none → Copilot; else `resolveFor` (`descriptor.probe`):
   - installed? no → schedule onboarding install → Copilot. 🟢
   - acpSupported? no → Copilot. 🟢
   - authenticated? no → schedule onboarding auth → Copilot. 🟢
   - else → target = acp `providerId`. 🟢

## Dispatch

- **ACP** → `rewritePromptForAcp` (regex first-line `/cmd` → `Run the "<cmd>" workflow [with input: …]`) → `sessionManager.send`; throw → invalidate cache → fallback. 🟢
- **Copilot** → `workbench.action.chat.open({query, files?})` (files only VS Code ≥ 1.95.0). 🟢

## Dependências

- `acp-session-manager` (send), `acp-provider-registry` (forHost), `onboarding-service` (install/auth), `utils/ide-host-detector`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Declarative routing table + 60 s cache | `chat-router.ts:159` | 🟢 |
| Slash-command rewrite (ACP agents own `/`) | `chat-dispatcher.ts:38` | 🟢 (R-X-4) |
| Always-available Copilot fallback | `chat-dispatcher.ts:83` | 🟢 |

## Estado Interno

The routing decision cache (60 s). 🟢

## Observabilidade

Onboarding prompts scheduled on probe misses. 🟡

## Riscos e Lacunas

- 🟡 Onboarding scheduling is fire-and-forget alongside the Copilot fallback (the current turn always uses Copilot when ACP isn't ready).
