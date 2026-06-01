# devin (module), Tarefas de Implementação

## Pré-requisitos

- [ ] VS Code `SecretStorage` + `Memento` available
- [ ] git CLI + a clean git repo with a remote
- [ ] `fetch` access to `https://api.devin.ai`
- [ ] Decision on ownership vs `cloud-agents` (see `questions.md`) before wiring polling

## Tarefas

- [ ] T-01, Define entities + enums + error taxonomy
  - Origem no legado: `entities.ts:31,73,108,158`; `types.ts:19,34,50,65,84`; `errors.ts:17,54`
  - Critério de pronto: `DevinSession/Task/Credentials/PullRequest` + `ApiVersion/DevinApiStatus/SessionStatus/TaskStatus` + `DevinError` + 11 subclasses compile
  - Confiança: 🟢

- [ ] T-02, Implement version detection + client factory + HTTP
  - Origem no legado: `api-version-detector.ts:24`; `devin-api-client-factory.ts:38`; `devin-api-http.ts:31,54-81`; clients `-v1/-v3`
  - Critério de pronto: `cog_`→v3 (orgId required), `apk_`→v1; HTTP error mapping correct (R-CD-1)
  - Confiança: 🟢

- [ ] T-03, Implement retry + rate limiter
  - Origem no legado: `retry-handler.ts:51,133-148`; `rate-limiter.ts:15,20,44`
  - Critério de pronto: 3 attempts, jittered backoff, `Retry-After`; ≥500 ms + ≤60/min gate (R-CD-10)
  - Confiança: 🟢

- [ ] T-04, Implement credentials manager + storage
  - Origem no legado: `devin-credentials-manager.ts:51,66`; `devin-session-storage.ts:81,151`
  - Critério de pronto: key + metadata separate keys; legacy read; 7-day retention cleanup
  - Confiança: 🟢

- [ ] T-05, Implement git pre-flight + commit/push
  - Origem no legado: `git-validator.ts:44`; `git-operations.ts:38,62-82`
  - Critério de pronto: clean-repo required; add/commit-if-changes/push (R-CD-11)
  - Confiança: 🟢

- [ ] T-06, Implement status mapper (statusDetail wins)
  - Origem no legado: `status-mapper.ts:42,60,77`
  - Critério de pronto: `statusDetail` overrides base `status`; terminal set correct (R-CD-3)
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, `cog_` without orgId throws (R-CD-1)
- [ ] TT-02, Retry honors `Retry-After`; max 3 attempts → `DevinMaxRetriesExceededError` (R-CD-10)
- [ ] TT-03, statusDetail `finished` overrides base `suspended` → completed (R-CD-3)
- [ ] TT-04, Dirty repo aborts task initiation (R-CD-11)

## Ordem Sugerida

1. T-01 (types/errors) → T-02 (client) → T-03 (resilience).
2. T-04 (creds/storage), T-05 (git), T-06 (status).
3. Use-case folders (`initiate-task`, `polling-cycle`, `pr-state-task-sync`).

## Lacunas Pendentes (🔴)

- 🔴 Resolve Devin ownership vs `cloud-agents` before wiring the poller (see `questions.md`).
