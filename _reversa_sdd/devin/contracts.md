# devin — External Contracts (Devin REST)

> Optional artifact (`doc_level=completo`). The Devin REST API surface this module consumes, version routing, error taxonomy, and resilience policy.
> Source: `devin-api-client*.ts`, `devin-api-http.ts`, `config.ts`, `errors.ts`. Confidence: 🟢 unless noted.

## 1. Base + versioning

- Base URL: `https://api.devin.ai` (`config.ts`). 🟢
- **Version is selected by token prefix** (R-CD-1, `api-version-detector.ts:31`):
  - `cog_` → **v3** (org-scoped; requires non-empty `orgId`, else `DevinOrgIdRequiredError`). `devin-api-client-v3.ts`.
  - `apk_` / `apk_user_` → **v1/v2** (unscoped). `devin-api-client-v1.ts`.
  - unknown prefix → throws `DevinInvalidTokenError`.
- Raw API payloads are snake_case; each client maps to camelCase. 🟢

## 2. Operations (client interface `devin-api-client.ts`)

| Operation | Request type | Response type | Notes |
|-----------|--------------|---------------|-------|
| createSession | `CreateSessionRequest` (`:30`): `prompt`, `title?`, `repos?: RepositoryLink[]`, `tags?`, `maxAcuLimit?`, `playbookId?` | `CreateSessionResponse` (`:90`) | starts a remote run |
| getSession | session id | `GetSessionResponse` (`:104`): incl. `statusDetail?`, `acusConsumed`, `isArchived`, PR info | drives polling |
| listSessions | `ListSessionsRequest` (`:49`) | `ListSessionsResponse` (`:122`) + `PageInfo` (`:81`) | enumeration |

Supporting types: `RepositoryLink` (`:21`), `PullRequestInfo` (`:72`). 🟢

> No cancel endpoint exists — cancellation is local-only (R-CD-2). 🟢

## 3. HTTP error mapping (`devin-api-http.ts:54-81`)

| HTTP | Mapped error |
|------|--------------|
| 401 / 403 | `DevinAuthenticationError` |
| 429 | `DevinRateLimitedError` (+ `parseRetryAfterMs`) |
| 5xx / other `!ok` | `DevinApiError { statusCode }` |
| `AbortError` | `DevinTimeoutError` |
| fetch throw | `DevinNetworkError` |

## 4. Status resolution (`status-mapper.ts`)

- Raw `DevinApiStatus`: `new\|claimed\|running\|exit\|error\|suspended\|resuming`.
- Raw `DevinStatusDetail`: `working\|waiting_for_user\|finished\|blocked\|(string)`.
- **`statusDetail` map wins over base `status` map** (R-CD-3); fallback → `running`. Terminal set (`:77`): `completed\|failed\|cancelled`.
- Mapped `SessionStatus`: `queued\|initializing\|running\|blocked\|completed\|failed\|cancelled`.

## 5. Resilience policy

| Policy | Value | Source |
|--------|-------|--------|
| Retry attempts | 3 | `config.ts:84-96` |
| Backoff | `base·2^(n-1)`, base 1 s, cap 30 s, +0–10% jitter | `retry-handler.ts:133-148` |
| Rate-limit honoring | `Retry-After` capped at 30 s | `retry-handler.ts` |
| Retryable errors | 5xx `DevinApiError`, network, timeout, rate-limited | `errors.ts:99-102,317` |
| Rate limiter | ≥500 ms between calls, ≤60/min (sliding window) | `rate-limiter.ts:15,20,44` |
| Network recovery | 5 consecutive failures | `network-recovery.ts:23` |
| Session timeout | non-terminal idle >4 h → warning | `session-timeout-handler.ts:18` |

## 6. Error taxonomy (`errors.ts:17,54`)

`DevinError { code; context? }` base + subclasses:
`DevinApiError {statusCode, errorCode?, isRetryable}`, `DevinTimeoutError`, `DevinNetworkError`, `DevinAuthenticationError`, `DevinCredentialsNotFoundError`, `DevinInvalidTokenError`, `DevinOrgIdRequiredError`, `DevinSessionNotFoundError`, `DevinInvalidSessionStateError`, `DevinRateLimitedError {retryAfterMs?}`, `DevinMaxRetriesExceededError {attempts, lastError?}`, `DevinValidationError {validationDetails?}`. 🟢

`DevinErrorCode` enum: `DEVIN_API_ERROR, DEVIN_TIMEOUT, DEVIN_NETWORK_ERROR, DEVIN_AUTH_FAILED, DEVIN_CREDENTIALS_NOT_FOUND, DEVIN_INVALID_TOKEN_FORMAT, DEVIN_ORG_ID_REQUIRED, DEVIN_SESSION_NOT_FOUND, DEVIN_RATE_LIMITED, DEVIN_VALIDATION_ERROR, DEVIN_MAX_RETRIES_EXCEEDED, DEVIN_INVALID_SESSION_STATE`. 🟢

## 7. Credentials storage

`SecretStorage` under separate keys: `gatomia.devin.apiKey` (the key) and `gatomia.devin.credentials` (metadata JSON, never the key). Legacy in-JSON-key format is read for back-compat. 🟢 `devin-credentials-manager.ts:66-72,86-95`
