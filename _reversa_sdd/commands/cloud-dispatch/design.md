# cloud-dispatch, Design Técnico

> HOW cloud dispatch works. Source: `cloud-agent-commands.ts:319-463`, `flowcharts/commands.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `handleDispatchTask` | `(item\|taskId, deps)` | `Promise<void>` | `:347` |
| `ensureActiveProvider` | `(deps)` | `boolean` | gate — `:319` |
| `createSessionWithRetry` | `(...)` | `AgentSession` | `:416` |

## Fluxo Principal (§5)

1. `ensureActiveProvider`: selected & credentialed? no → chain `selectProvider`/`configureProvider` → return. 🟢
2. `extractTaskFromItem`; no task → error. 🟢
3. `isTaskAlreadyRunning(specTaskId)`? yes → warn "Open Session / Cancel" → return. 🟢
4. Build `SpecTask` + `SessionContext` (git branch/remote/featurePath). 🟢
5. `createSessionWithRetry`: loop attempt ≤2 → `provider.createSession`:
   - ok → `storage.create`. 🟢
   - recoverable `ProviderError` & attempts left → backoff `1000*(n+1)` ms → retry. 🟢
   - non-recoverable / exhausted → throw → `showErrorMessage`. 🟢
6. polling running? no → `pollingService.start(30000)`; then `onSessionCreated` + `onRefresh`. 🟢

## Dependências

- `cloud-agents` (`ProviderRegistry`, `AgentSessionStorage`, `AgentPollingService`, `ProviderError`), git helpers for the context. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Duplicate-dispatch guard (open existing instead) | `cloud-agent-commands.ts:440-463` | 🟢 (R-CD-13) |
| Bounded recoverable retry with linear backoff | `:413-438` | 🟢 |
| Polling autostart at 30 s | `:395-397` | 🟢 |

## Estado Interno

None (DI handler). 🟢

## Observabilidade

Error surfaced via `showErrorMessage`; session-created/refresh callbacks. 🟢

## Riscos e Lacunas

- 🟡 The `devin` vs `cloud-agents` dispatch ownership (which provider handles Devin) ties to `cloud-agents/questions.md` Q1.
