# initiate-task, Design Técnico

> HOW a Devin session is initiated. Source: `devin-session-manager.ts` (416), `git-*`, `flowcharts/devin.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `DevinSessionManager.startTask` | `(params)` | `Promise<DevinSession>` | `:159` |
| `DevinSessionManager.startTaskGroup` | `(params)` | `Promise<DevinSession>` | `:220` |
| `mapSpecTaskToDevinPrompt` | `(params)` | `string` | `:334` |
| `mapTaskGroupToDevinPrompt` | `(params)` | `string` | one PR / base branch — `:360,368,402` |
| `validateGitState` | `()` | validation result | `git-validator.ts:44` |
| `commitAndPush` | `(branch)` | void | `git-operations.ts:38` |

## Fluxo Principal

1. `validateGitState` — must be a git repo with a clean working tree; else `showGitValidationError` + abort. 🟢
2. `commitAndPush` — `git add -A` → commit only if changes → `git push origin <branch>`; push failure surfaces. 🟢
3. `startTask` / `startTaskGroup` builds the prompt (`mapSpecTaskToDevinPrompt` / `mapTaskGroupToDevinPrompt`). 🟢
4. **Resolve client**: if cached use it; else `credentials.getOrThrow` → `detectApiVersion` → `cog_` (+orgId) → `DevinApiClientV3`; else `DevinApiClientV1`. 🟢
5. `client.createSession` via `devinApiRequest` (HTTP error mapping → typed errors). 🟢
6. Build a local `DevinSession{status:INITIALIZING, task:QUEUED}`; `storage.save` + `credentials.markUsed`. 🟢
7. If the poller is not running, `DevinPollingService.start`. 🟢

## Fluxos Alternativos

- **HTTP errors** map to `DevinAuthenticationError` (401/403), `DevinRateLimitedError` (429 + `Retry-After`), `DevinApiError` (5xx/other), `DevinTimeoutError` (abort), `DevinNetworkError` (fetch throw); retry-eligible per `isRetryableError`. 🟢
- **Batch** — `BatchProcessor.processBatch` runs one session per task sequentially, tolerating partial failure and emitting progress. 🟢

## Dependências

- `git-validator`, `git-operations`, `devin-api-client-factory`, `devin-session-storage`, `devin-credentials-manager`, `withRetry`, `RateLimiter`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Commit+push before delegating (Devin works from the remote branch) | `git-operations.ts:62` | 🟢 |
| Task-group = single PR on base branch (no per-task branches) | `devin-session-manager.ts:368,402` | 🟢 |

## Estado Interno

The created `DevinSession` is appended to the persisted list; the resolved client is cached. 🟢

## Observabilidade

`DevinProgressEvent` (`pr_created`, `status_change`, `milestone`) emitted; telemetry on create. 🟢

## Riscos e Lacunas

- 🟡 Behavior when push succeeds but createSession fails (orphan pushed branch) not detailed — confirm in `devin-session-manager.ts:159`.
