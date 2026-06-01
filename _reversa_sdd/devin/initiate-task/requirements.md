# initiate-task (use-case)

> Use-case under `devin`. Git pre-flight → commit/push → create a Devin session (single task or task group).
> Source: `devin-session-manager.ts`, `git-*`, `flowcharts/devin.md` §1.

## Visão Geral

Validates the git state, commits and pushes the working branch, builds a Devin prompt (single task or task group), resolves the version-specific API client, creates the remote session, persists it locally as `INITIALIZING`, and starts polling. 🟢

## Responsabilidades

- Pre-flight git (clean repo) and `commitAndPush`. 🟢
- Build the prompt: `mapSpecTaskToDevinPrompt` (single) / `mapTaskGroupToDevinPrompt` (group, one PR / base branch). 🟢
- Resolve/cache the API client (version by token prefix; v3 requires orgId). 🟢
- `createSession`, persist `INITIALIZING`, `markUsed` credentials, start poller if idle. 🟢

## Regras de Negócio

- **R-CD-11** Clean git repo required; `commitAndPush` = add/commit-if-changes/push. 🟢 `git-validator.ts:44`; `git-operations.ts:62`
- **R-CD-1** version by token prefix; v3 requires orgId. 🟢 `api-version-detector.ts:31`
- **R-CD-9** Task-group prompt forces one PR / no per-task branches / base-branch target. 🟢 `devin-session-manager.ts:368,402`
- New session is created `INITIALIZING` with its task `QUEUED`. 🟢 `flowcharts/devin.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Git pre-flight | Must | Non-clean / non-repo → abort with a git validation error |
| RF-02 | commit + push | Must | `git add -A` → commit-if-changes → `git push origin <branch>`; push failure surfaces |
| RF-03 | Prompt building | Must | single → `mapSpecTaskToDevinPrompt`; group → one-PR base-branch prompt (R-CD-9) |
| RF-04 | Client resolution | Must | version detected; v3 without orgId throws (R-CD-1) |
| RF-05 | Create + persist + poll | Must | createSession → `DevinSession{INITIALIZING}` saved; credentials `markUsed`; poller started if idle |
| RF-06 | Sequential batch | Should | a batch runs one session per task with partial-failure tolerance + progress events |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | API call wrapped by retry + rate limiter | `devin-session-manager.ts`; `retry-handler.ts` | 🟢 |
| Segurança | Credentials fetched from `SecretStorage` (getOrThrow) | `flowcharts/devin.md` §1 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um repositório git limpo e credenciais apk_ válidas
Quando o usuário inicia uma task
Então o branch é commitado e pushado, a sessão é criada INITIALIZING e o poller inicia

Dado um token cog_ sem orgId
Quando a inicialização resolve o cliente
Então DevinOrgIdRequiredError é lançado e nenhuma sessão é criada

Dado um task group
Quando o prompt é montado
Então ele força um único PR no branch base (R-CD-9)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Git + create + persist (RF-01–RF-05) | Must | Entry point to Devin delegation |
| Batch (RF-06) | Should | Convenience over single-task |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `devin-session-manager.ts` | `startTask` (159), `startTaskGroup` (220), `mapSpecTaskToDevinPrompt` (334), `mapTaskGroupToDevinPrompt` (360) | 🟢 |
| `git-validator.ts` / `git-operations.ts` | `validateGitState` (44) / `commitAndPush` (38) | 🟢 |
| `batch-processor.ts` | `processBatch` (122) | 🟢 |
| `spec-content-reader.ts` | `extractTaskFromSpec` (53) | 🟢 |
