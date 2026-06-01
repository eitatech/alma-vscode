# cloud-dispatch (use-case)

> Use-case under `commands`. `gatomia.dispatchTask` — dispatch a spec task to the active cloud provider.
> Source: `cloud-agent-commands.ts`, `flowcharts/commands.md` §5.

## Visão Geral

Dispatches a spec task to the active cloud provider: ensure a selected + credentialed provider, extract the task, block duplicates (active session for the same spec-task), build the session context, create the session with bounded recoverable retry, persist, and auto-start polling. 🟢

## Responsabilidades

- `ensureActiveProvider`: provider-selected + credentialed gate (chains select/configure). 🟢
- Extract the task from the tree item / id; error if none. 🟢
- Duplicate guard: active session for the spec-task → "Open Session / Cancel". 🟢
- Build `SpecTask` + `SessionContext` (git branch/remote/featurePath). 🟢
- `createSessionWithRetry` (≤2, recoverable `ProviderError`, linear backoff) → `storage.create` → start polling (30 s). 🟢

## Regras de Negócio

- **R-CD-13** Retry ≤2 only on recoverable `ProviderError` (backoff `RETRY_DELAY_MS*(attempt+1)`); duplicates blocked. 🟢 `cloud-agent-commands.ts:413-463`
- Cloud cancel refuses read-only sessions. 🟢 `cloud-agent-commands.ts:555-560`
- Polling auto-starts at 30 s on first dispatch. 🟢 `cloud-agent-commands.ts:395-397`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Provider gate | Must | not selected/credentialed → chain select/configure → return |
| RF-02 | Task extraction | Must | no task → error |
| RF-03 | Duplicate guard | Must | active session for spec-task → "Open Session / Cancel", no re-dispatch (R-CD-13) |
| RF-04 | Create with retry | Must | ≤2 retries on recoverable ProviderError; else throw → error message |
| RF-05 | Persist + poll | Must | `storage.create`; polling autostart 30 s if not running |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Bounded recoverable retry with backoff | `cloud-agent-commands.ts:413-438` | 🟢 |
| Segurança | Provider must be credentialed before dispatch | `cloud-agent-commands.ts:319` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado nenhum provider ativo
Quando dispatchTask é chamado
Então select/configure é encadeado e o dispatch não prossegue (RF-01)

Dado uma sessão ativa para o mesmo spec-task
Quando dispatchTask é chamado de novo
Então "Open Session / Cancel" aparece, sem re-dispatch (R-CD-13)

Dado um ProviderError recuperável
Quando createSession falha
Então é retentado até 2x com backoff linear antes de falhar (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Gate + extract + dup + retry + persist (RF-01–RF-05) | Must | The cloud dispatch path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `cloud-agent-commands.ts` | `ensureActiveProvider` (319), `handleDispatchTask` (347), `createSessionWithRetry` (416,413-438), dup guard (440-463) | 🟢 |
