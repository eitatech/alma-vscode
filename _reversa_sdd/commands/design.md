# commands (module), Design Técnico

> Module-level `design.md`. Source: `src/commands/`. Confidence: 🟢 unless noted.

## Interface (command ids)

| Family | Constant | Ids |
|--------|----------|-----|
| Agent Chat | `AGENT_CHAT_COMMANDS` | `gatomia.agentChat.{startNew, openForSession, cancel, cleanupWorktree, changeMode, changeModel, changeExecutionTarget, cleanupOrphanedWorktree, newSession}` |
| Cloud Agent | `CLOUD_AGENT_COMMANDS` | `gatomia.{selectProvider, changeProvider, configureProvider, dispatchTask, dispatchFullSpec, cancelSession, removeSession, refreshCloudAgents}` |
| Devin | `DEVIN_COMMANDS` | start / configure-credentials / cancel / open-progress / start-all |

Each family exports `register*Commands(deps): Disposable[]`. 🟢

## Key handlers

| Símbolo | Location | Role |
|---------|----------|------|
| `handleStartNew` | `agent-chat-commands.ts:207` | cap → start → register → attachRunner → createPanel → **attachPanel** → reveal |
| `enforceConcurrentCap` | `:234` | checkCapacity → promptForCap → abort/cancel-start/cancel-only |
| `handleOpenForSession` | `:284` | restart hydrate; focusPanel reuse else create |
| `handleChangeModel` / `tryAcpSetModel` | `:487/528` | `set_model`; `ACP_NOT_SUPPORTED` → legacy fallback |
| `handleChangeMode` / `handleChangeExecutionTarget` | `:462/584` | next-turn mode; target immutable when running |
| `handleCleanupWorktree` | `:409` | two-step destructive |
| `handleDispatchTask` / `createSessionWithRetry` | `cloud-agent-commands.ts:347/416` | dup guard + retry(2) |
| `handleNewSession` | `agent-chat-new-session.ts:183` | tier-grouped QuickPick → startNew |

## Fluxo Principal (visão de módulo)

1. `extension.ts` calls `register*Commands(deps)`; handlers wired with DI bags. 🟢
2. Tree/palette actions → handlers (args coerced). 🟢
3. Handlers orchestrate the feature services (start/open/change/cleanup/dispatch). 🟢

> Detailed flows: `start-new-session/`, `open-for-session/`, `change-model/`, `worktree-cleanup/`, `cloud-dispatch/`.

## Decision flows (5)

See `flowcharts/commands.md`:
- **Concurrent-cap** (§1), **open/reuse** (§2), **change-model fallback** (§3), **two-step cleanup** (§4), **cloud dispatch guard+retry** (§5), **tier QuickPick** (§6).

## Dependências

- `agent-chat` (registry/store/worktree-service/`WorktreeCleanupWarningRequired`/cap-warning-prompt), `services` (`ACP_NOT_SUPPORTED`), `cloud-agents` (registry/storage/polling/`ProviderError`), `devin` (config/credentials/session-manager/git-validator/batch), `panels` (`DevinProgressPanel`). 🟢
- Consumed by `extension.ts`. External: `vscode` (`commands`, `QuickPick`/`InputBox`), `node:path`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Command handler = SoT for panel registration | `agent-chat-commands.ts:221-226` | 🟢 (R-AC-11) |
| DI pure-function handlers + lazy `vscode` resolution for testability | module-wide | 🟢 |
| Cap enforcement fails closed | `:238-260` | 🟢 |
| Bounded recoverable retry for cloud dispatch | `cloud-agent-commands.ts:413-438` | 🟢 |

## Estado Interno

None persistent — handlers operate on injected services. 🟢

## Observabilidade

Telemetry: cap abort, `PANEL_REOPENED`, dispatch events. 🟢

## Resoluções de lacunas anteriores

- 🟢 **Resolved (panels Q1):** `gatomia.agentChat.newSession` is the **QuickPick** (`agent-chat-new-session.ts`), not the `NewSessionPanel` stub — the stub is dormant on the active path.
- 🟢 **Confirms R-AC-11:** `attachPanel` lives only in `handleStartNew`.

## Riscos e Lacunas

- 🔴 `package.json` `contributes.commands` / `menus` (view/item/context, palette `when`, icons) are not in this folder — confirm against `package.json` (see `questions.md`).
