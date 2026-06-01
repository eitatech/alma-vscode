# inputbar-composer-gating, Design Técnico

> HOW gating works. Source: `input-bar.tsx`, `new-session-composer.tsx`, `flowcharts/webview-agent-chat.md` §4–§5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `InputBar` | props | JSX | `:94` |
| `resolveDisabledReason` | `(state)` | reason \| null | `:259` |
| `ModelChip` | props | JSX | `:300` |
| `NewSessionComposer` | props | JSX | `new-session-composer.tsx:83` |

## InputBar decision (§4)

`readOnly?` → "read-only cloud session"; else `acceptsFollowUp == false?` → "agent does not accept follow-up"; else `terminal?` → "session ended, start a new one"; else `value.trim length > 0?` no → Send disabled; yes → canSend → `busy?` → Stop (onCancel) / Send (handleSubmit). 🟢

## Composer gating (§5)

`defaultProvider = first enabled` → seed model/thinking/role = provider's first option → on provider change: reset model/thinking/role, keep agentFile, `probeModels` → `canSubmit = providerId set AND prompt.trim > 0` → Cmd/Ctrl+Enter or click → `onStart(NewSessionRequest{provider, model, agentFile, thinking, role, taskInstruction})` → host `control/new-session`. 🟢

## Dependências

- The bridge (catalog, modelsLoading, probeModels action). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Precedence-based disabled reason | `input-bar.tsx:259` | 🟢 |
| Provider switch keeps the workspace-scoped agent file | `new-session-composer.tsx:129` | 🟢 |

## Estado Interno

InputBar value; composer selection (provider/model/thinking/role/agentFile/prompt). 🟢

## Observabilidade

Disabled reasons surfaced to the user. 🟡

## Riscos e Lacunas

None. 🟢
