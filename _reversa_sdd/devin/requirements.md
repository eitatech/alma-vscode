# devin (module)

> Module-level `requirements.md`. Bounded context: **Cloud Delegation**. Spec lineage: `001-devin-integration`.
> Source: `src/features/devin/` (~5,460 LOC, 38 source files). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`devin` is the **original, standalone Devin REST integration**. It predates `cloud-agents` and is still wired in `extension.ts`. It owns: dual API versioning (v1/v2 vs v3, by token prefix), credentials in `SecretStorage`, session lifecycle + 7-day retention in `workspaceState`, polling (grace cycles + PR-state detection), status mapping, prompt building (single task + task group), sequential batch processing, git validation/commit-push, PR review/link handling, `tasks.md` checkbox sync, and a deep error taxonomy with retry/backoff + client-side rate limiting. 🟢

> ⚠️ `cloud-agents/adapters/devin-adapter.ts` reuses parts of this module (`DevinCredentialsManager`, the API client interface, `resolveSessionStatus`). The ownership boundary is a 🔴 gap — see `questions.md`.

## Responsabilidades

- Detect API version by token prefix and build the right REST client (v1/v2 unscoped vs v3 org-scoped). 🟢
- Store/retrieve Devin credentials in `SecretStorage` (key + metadata under separate keys). 🟢
- Pre-flight git (clean repo) and commit+push before delegating. 🟢
- Build Devin prompts for a single task and a task group (one PR / base branch). 🟢
- Create + persist sessions; cancel locally; enforce 7-day retention. 🟢
- Poll sessions (5 s default), resolve status (statusDetail wins), sync task statuses, detect PR-state changes. 🟢
- Apply retry/backoff (honoring `Retry-After`) and client-side rate limiting to every API call. 🟢
- Mark `tasks.md` checkboxes on task completion / PR merge. 🟢

## Regras de Negócio

- **R-CD-1** Token prefix selects version: `cog_` → v3 (org-scoped, requires `orgId`, else `DevinOrgIdRequiredError`); `apk_`/`apk_user_` → v1/v2; unknown prefix throws. 🟢 `api-version-detector.ts:31`; `config.ts:40,52`; `devin-api-client-v3.ts:40`
- **R-CD-2** Cancellation is **local-only** (no Devin cancel endpoint); rejects already-terminal sessions. 🟢 `devin-session-manager.ts:276,292`
- **R-CD-3** `statusDetail`/`status_enum` overrides base `status` (base can be stale). 🟢 `status-mapper.ts:48-71`
- **R-CD-4** Polling: 5 s default (min 3, max 60); stop after grace exhausts. 🟢 `config.ts:62-74`
- **R-CD-5** `GRACE_CYCLES_AFTER_TERMINAL=6`; recently-completed = terminal + updated <5 min + has PRs; terminal sessions re-polled update **only** PR data. 🟢 `devin-polling-service.ts:70,291,352`
- **R-CD-9** Task-group prompt forces **one PR / no per-task branches**, PR target = base branch. 🟢 `devin-session-manager.ts:368,402`
- **R-CD-10** Retry: 3 attempts, exp backoff `base·2^(n-1)` (base 1 s, cap 30 s, +10% jitter), honors `Retry-After`; rate limiter ≥500 ms between calls, ≤60/min. 🟢 `config.ts:84-96`; `retry-handler.ts:133-148`; `rate-limiter.ts:15,20,44`
- **R-CD-11** Pre-flight git: clean working tree required; `commitAndPush` = `git add -A` → commit-if-changes → `git push origin <branch>`. 🟢 `git-validator.ts:44-88`; `git-operations.ts:62-82`
- **R-CD-12** A PR state change (open→merged) emits an event → marks the `tasks.md` checkbox (idempotent single write). 🟢 `devin-polling-service.ts:397`; `spec-status-updater.ts:91,140`
- HTTP mapping: 401/403→auth, 429→rate-limited (parse `Retry-After`), `!ok`→`DevinApiError`, `AbortError`→timeout, else network. 🟢 `devin-api-http.ts:54-81`
- 7-day retention: cleanup keeps non-terminal + terminal newer than cutoff. 🟢 `config.ts:130`; `devin-session-storage.ts:151`
- Credentials: API key + metadata under separate `SecretStorage` keys; legacy in-JSON-key format read for back-compat. 🟢 `devin-credentials-manager.ts:66-72,86-95`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Token-prefix version detection + client factory | Must | `cog_`→v3 (needs orgId), `apk_`→v1; unknown throws (R-CD-1) |
| RF-02 | Credential storage in SecretStorage | Must | key + metadata under separate keys; legacy format read |
| RF-03 | Git pre-flight + commit/push | Must | clean-repo required; `commitAndPush` runs add/commit/push (R-CD-11) |
| RF-04 | Create session (task / task group) | Must | builds prompt, calls createSession, persists `INITIALIZING` |
| RF-05 | Local-only cancellation | Must | marks local `cancelled`; rejects terminal (R-CD-2) |
| RF-06 | Poll + status resolution | Must | 5 s loop; statusDetail wins; grace 6 cycles (R-CD-3, R-CD-5) |
| RF-07 | PR→tasks.md sync | Must | merge marks `- [ ] TXXX` → `- [x]` (R-CD-12) |
| RF-08 | Retry/backoff + rate limiting | Must | 3 attempts, jittered backoff, `Retry-After`; ≤60/min (R-CD-10) |
| RF-09 | 7-day retention cleanup | Should | terminal sessions older than cutoff removed |
| RF-10 | Sequential batch processing | Should | one session per task with partial-failure tolerance |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Disponibilidade | Retry with backoff + network-recovery threshold (5 failures) | `retry-handler.ts:51`; `network-recovery.ts:23` | 🟢 |
| Performance | Client-side sliding-window rate limiter (≥500 ms, ≤60/min) | `rate-limiter.ts:15,20,44` | 🟢 |
| Segurança | API key isolated in `SecretStorage`; never in the metadata blob | `devin-credentials-manager.ts:66` | 🟢 |
| Confiabilidade | Pre-flight git guarantees a pushable base before delegating | `git-validator.ts:44` | 🟢 |
| Usabilidade | Session-timeout handler warns on idle >4 h | `session-timeout-handler.ts:18` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um token com prefixo cog_ e nenhum orgId
Quando o cliente é resolvido
Então DevinOrgIdRequiredError é lançado (R-CD-1)

Dado um repositório git sujo
Quando o usuário inicia uma task com Devin
Então a validação falha e a sessão não é criada (R-CD-11)

Dado uma sessão terminada com um PR que passa a merged durante a janela de graça
Quando o poll detecta a mudança
Então o checkbox correspondente em tasks.md é marcado como [x] (R-CD-12)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Versioning, credentials, create, poll, PR-sync (RF-01–RF-07) | Must | The standalone Devin delegation path |
| Retry/rate-limit (RF-08) | Must | Required for resilient API use |
| Retention + batch (RF-09, RF-10) | Should | Hygiene + convenience |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `devin-session-manager.ts` | `startTask` (159), `startTaskGroup` (220), `cancelSession` (283) | 🟢 |
| `devin-polling-service.ts` | `pollOnce` (234), `pollSession` (305) | 🟢 |
| `devin-api-client-factory.ts` / `api-version-detector.ts` | client factory + version detection | 🟢 |
| `devin-api-client-v1.ts` / `-v3.ts` / `devin-api-http.ts` | REST clients + HTTP | 🟢 |
| `status-mapper.ts` | `resolveSessionStatus` (60) | 🟢 |
| `retry-handler.ts` / `rate-limiter.ts` | `withRetry` (51) / `acquire` (77) | 🟢 |
| `git-validator.ts` / `git-operations.ts` | `validateGitState` (44) / `commitAndPush` (38) | 🟢 |
| `spec-status-updater.ts` | `markTaskAsCompleted` (140) | 🟢 |
| `devin-credentials-manager.ts` / `devin-session-storage.ts` | credentials + persistence | 🟢 |
| `errors.ts` | `DevinError` + 11 subclasses | 🟢 |

> See `contracts.md` (REST v1/v2/v3 + error taxonomy + retry) and `questions.md` (🔴 ownership overlap).
