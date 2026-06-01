# change-model, Design Técnico

> HOW reconfiguration works. Source: `agent-chat-commands.ts:462-596`, `flowcharts/commands.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `handleChangeModel` | `(sessionId, modelId, deps)` | `Promise<void>` | `:487` |
| `tryAcpSetModel` | `(...)` | `boolean` (handled) | `:528` |
| `handleChangeMode` | `(sessionId, modeId, deps)` | `Promise<void>` | `:462` |
| `handleChangeExecutionTarget` | `(sessionId, target, deps)` | `Promise<void>` | `:584` |

## Fluxo Principal — changeModel (§3)

1. Resolve session (registry || store); found & modelId changed? no → return. 🟢
2. `tryAcpSetModel`: `source==acp && manager?` no → fallback; yes → `manager.setSessionModel`:
   - ok → done (manager fires models-changed). 🟢
   - err includes `ACP_NOT_SUPPORTED` → fallback. 🟢
   - other err → re-throw to the error boundary. 🟢
3. fallback → `runner.recordModelChange?` → `store.updateSession(selectedModelId)`. 🟢

## Mode + execution-target

- **changeMode**: record in transcript first, then persist (effective next turn). 🟢 `:475-484`
- **changeExecutionTarget**: reject when `lifecycleState === 'running'`. 🟢 `:594-596`

## Dependências

- `agent-chat` (registry/store/runner), `services/acp` (`ACP_NOT_SUPPORTED`), the ACP session manager. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Experimental-first with a narrow fallback trigger | `:545-551` | 🟢 |
| Mode change audited in transcript before persistence | `:475-484` | 🟢 |
| Execution target immutable after first turn | `:594-596` | 🟢 |

## Estado Interno

None (DI handler). 🟢

## Observabilidade

System messages for mode/model changes (audited in transcript). 🟢

## Riscos e Lacunas

None. 🟢
