# commands (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra**.
> Source: `src/commands/` (~2,019 LOC, 4 files). Complexity: medium.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`commands` is the **VS Code command-handler layer**. Each file declares a frozen map of `gatomia.*` command ids and exports `register*Commands(deps): Disposable[]` (called from `extension.ts`), with handler logic as **pure, dependency-injected functions** (unit-testable). Three families — Agent Chat (spec 018), Cloud Agent multi-provider (spec 016), legacy Devin (spec 001). Handlers hold the orchestration logic (cap enforcement, two-step destructive confirm, retry, duplicate-dispatch guards); registration is a thin wrapper that normalizes arg shapes. 🟢

## Responsabilidades

- Register `gatomia.*` commands and normalize args (raw string vs tree item). 🟢
- Start/open/cancel Agent Chat sessions; own panel registration (`attachPanel`). 🟢
- Change mode/model/execution-target with the correct timing + fallbacks. 🟢
- Two-step destructive worktree cleanup. 🟢
- Cloud dispatch (provider gate, dup guard, bounded retry, polling). 🟢
- Legacy Devin start/configure/cancel/batch. 🟢

## Regras de Negócio

- **R-AC-11** `handleStartNew` is the **single source of truth** for panel registration (`attachPanel`); the panel never self-registers. 🟢 `agent-chat-commands.ts:221-226`
- Concurrent-ACP-cap enforcement only runs when `concurrentCap` + `checkCapacity` are wired; no prompt helper ⇒ fail closed (abort). 🟢 `agent-chat-commands.ts:238-260`
- `openForSession` lazily hydrates the registry from the store after reload; honors one-panel-per-session via `focusPanel` (FR-008). 🟢 `agent-chat-commands.ts:297-313`
- **R-AC-8** Mode change recorded in transcript **before** the store patch; effective next turn. 🟢 `agent-chat-commands.ts:475-484`
- Execution-target change rejected once a turn has run (`running`) — immutable after first turn. 🟢 `agent-chat-commands.ts:594-596`
- **R-AC-9** Worktree cleanup re-throws `WorktreeCleanupWarningRequired` into a `warning` (two-step destructive). 🟢 `agent-chat-commands.ts:447-450`
- `changeModel` prefers experimental `session/set_model`; only `ACP_NOT_SUPPORTED` triggers fallback (other errors re-thrown). 🟢 `agent-chat-commands.ts:545-551`
- New-session QuickPick groups by tier (Installed / via npx / Install required); install-required opens the URL. 🟢 `agent-chat-new-session.ts:115-165`
- **R-CD-13** Cloud dispatch retries ≤2 only on recoverable `ProviderError` (linear backoff); blocks duplicates (active session for same spec-task → "Open Session / Cancel"). 🟢 `cloud-agent-commands.ts:413-463`
- Cloud cancel refuses read-only sessions; polling auto-starts at 30 s on first dispatch. 🟢 `cloud-agent-commands.ts:555-560,395-397`
- **R-CD-1** Devin `cog_` keys require an Organization ID (v3). 🟢 `devin-commands.ts:239-249`
- **R-CD-11** Devin task start gated by `validateGitState` + explicit confirmation. 🟢 `devin-commands.ts:181-199`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Register command families + arg coercion | Must | `register*Commands` returns Disposables; tree-item args coerced |
| RF-02 | Start new session | Must | cap-check → start → register → attachRunner → createPanel → attachPanel → reveal (R-AC-11) |
| RF-03 | Open for session | Must | restart hydrate from store; focusPanel reuse else create |
| RF-04 | Change mode/model/target | Must | mode pre-recorded; model set_model+fallback; target rejected when running |
| RF-05 | Worktree cleanup | Must | two-step destructive (warning → confirm) (R-AC-9) |
| RF-06 | Cloud dispatch | Must | provider gate → dup guard → retry(≤2) → polling (R-CD-13) |
| RF-07 | Devin commands | Should | start (git+confirm), configure (cog_→orgId), cancel, batch |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Testabilidade | Handlers are DI pure functions; lazy `vscode` resolution | `agent-chat-commands.ts` (deps); `:932` algorithms | 🟢 |
| Segurança | Destructive worktree cleanup needs explicit 2-step confirm | `agent-chat-commands.ts:447-450` | 🟢 |
| Confiabilidade | Cap enforcement fails closed without a prompt helper | `agent-chat-commands.ts:238-260` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado capacidade no limite e um prompt helper
Quando startNew é chamado
Então o usuário escolhe cancelar-e-iniciar / cancelar / abortar antes de qualquer start

Dado uma sessão já em execução para um spec-task
Quando dispatchTask é chamado de novo
Então um aviso "Open Session / Cancel" aparece em vez de re-despachar (R-CD-13)

Dado um worktree sujo
Quando cleanupWorktree(confirmedDestructive=false)
Então retorna warning (inspeção) e exige segunda confirmação (R-AC-9)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Register + start + open + change + cleanup + dispatch (RF-01–RF-06) | Must | The command surface |
| Devin (RF-07) | Should | Legacy path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-commands.ts` | `handleStartNew` (207), `enforceConcurrentCap` (234), `handleOpenForSession` (284), `handleChangeModel` (487), `handleCleanupWorktree` (409) | 🟢 |
| `cloud-agent-commands.ts` | `handleDispatchTask` (347), `createSessionWithRetry` (416), `ensureActiveProvider` (319) | 🟢 |
| `devin-commands.ts` | `handleStartSingleTask` (165), `handleStartAllTasks` (281) | 🟢 |
| `agent-chat-new-session.ts` | `handleNewSession` (183), `buildQuickPickItems` (127) | 🟢 |

> See `questions.md` for the 🔴 `package.json` contributions gap and the prior-gap resolutions.
