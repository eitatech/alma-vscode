# create-session (use-case)

> Use-case under `cloud-agents`. Dispatch a spec task to a cloud provider and create a session.
> Source: `cloud-agent-provider.ts`, `adapters/*`, `agent-session-storage.ts`, `flowcharts/cloud-agents.md` §1.

## Visão Geral

Resolves the active provider, ensures credentials, builds the provider-specific request (Devin referential prompt or a GitHub issue with `agentAssignment`), maps the response to a normalized `AgentSession{status:PENDING}`, persists it, and notifies the UI. 🟢

## Responsabilidades

- Resolve the active provider; error if none. 🟢
- Ensure credentials (prompt if missing); error if unsaved. 🟢
- Build + send the provider create request and map to `AgentSession`. 🟢
- Persist the session (`PENDING`) and fire `onUpdated`. 🟢

## Regras de Negócio

- An active provider must be configured; otherwise dispatch errors. 🟢 `provider-registry.ts:72`
- Devin: `providerSessionId` = Devin session id; GitHub: `providerSessionId` = `owner/repo#number`. 🟢 `flowcharts/cloud-agents.md` §1
- New sessions start `PENDING`. 🟢 `agent-session-storage.ts`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Active-provider gate | Must | No active provider → error, no session created |
| RF-02 | Credential ensure | Must | Missing credentials → prompt; if unsaved → error |
| RF-03 | Devin create | Must | Builds a referential prompt from spec artifacts, calls Devin REST, maps to `AgentSession` |
| RF-04 | GitHub create | Must | Resolves repo id (GraphQL), builds issue body, creates issue with `agentAssignment`, maps to `AgentSession` |
| RF-05 | Persist + notify | Must | Session saved `PENDING`; `onUpdated` fired |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Credentials gated and stored in `SecretStorage` before any API call | `flowcharts/cloud-agents.md` §1; `agent-session-storage.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um provider Devin ativo com credenciais
Quando uma task é despachada
Então um referential prompt é montado, a Devin REST cria a sessão, e uma AgentSession PENDING é persistida

Dado um provider GitHub Copilot ativo
Quando uma task é despachada
Então um issue com agentAssignment é criado e a AgentSession recebe providerSessionId = owner/repo#number

Dado nenhum provider ativo
Quando uma task é despachada
Então o despacho falha com erro e nenhuma sessão é criada
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Provider/credential gates + create + persist (RF-01–RF-05) | Must | The entire entry point to cloud delegation |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `cloud-agent-provider.ts` | `createSession` (85) | 🟢 |
| `adapters/devin-adapter.ts` | `createSession` (280) | 🟢 |
| `adapters/github-copilot-adapter.ts` | `createSession` (161) | 🟢 |
| `agent-session-storage.ts` | `create` / persistence | 🟢 |
