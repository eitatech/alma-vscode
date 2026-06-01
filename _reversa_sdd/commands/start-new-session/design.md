# start-new-session, Design Técnico

> HOW startNew + QuickPick work. Source: `agent-chat-commands.ts`, `agent-chat-new-session.ts`, `flowcharts/commands.md` §1,§6.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `handleStartNew` | `(params, deps)` | `Promise<void>` | `:207` |
| `enforceConcurrentCap` | `(deps)` | decision | `:234` |
| `handleNewSession` | `(deps)` | `Promise<void>` | `agent-chat-new-session.ts:183` |
| `buildQuickPickItems` | `(providers)` | items + separators | `:127` |

## Fluxo Principal — startNew (§1)

1. `enforceConcurrentCap`: `concurrentCap` + `checkCapacity` wired? no → proceed. yes → `capacity = checkCapacity(acp, cap)`; ok → proceed; else `promptForCap` wired? no → telemetry abort + return; yes → decision: abort → stop; cancel-and-start → cancel idle runner + proceed; cancel-only → cancel idle + stop. 🟢
2. proceed → `startAcpSession(params)` → session + runner. 🟢
3. `registry.registerSession` → `registry.attachRunner` → `createPanel(session)` → `registry.attachPanel` (SoT) → `panel.reveal`. 🟢

## Fluxo Principal — QuickPick (§6)

1. `listProviders` → `buildQuickPickItems` (bucket Installed / via npx / Install required + separators). 🟢
2. `showQuickPick` → picked & providerId? re-resolve against the original list (QuickPick may drop custom fields). 🟢
3. install-required → `openInstallUrl(env.openExternal)`; else `showInputBox(task)` → `startNew(agentId, displayName, taskInstruction)`. 🟢

## Dependências

- `agent-chat` (registry/store/`startAcpSession`/cap-warning-prompt), `panels` (createPanel), `vscode` QuickPick/InputBox. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| attachPanel only here (R-AC-11) | `agent-chat-commands.ts:221-226` | 🟢 |
| Cap fails closed | `:238-260` | 🟢 |
| Re-resolve QuickPick pick against original list | `agent-chat-new-session.ts:209-235` | 🟢 |

## Estado Interno

None (DI handler). 🟢

## Observabilidade

Telemetry: cap abort reason, session start. 🟢

## Riscos e Lacunas

None. 🟢
