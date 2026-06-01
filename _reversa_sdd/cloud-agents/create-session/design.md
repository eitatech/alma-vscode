# create-session, Design Técnico

> HOW a cloud session is created. Source: `adapters/*`, `cloud-agent-provider.ts`, `flowcharts/cloud-agents.md` §1.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `CloudAgentProvider.createSession` | `(task, context: SessionContext)` | `Promise<AgentSession>` | `:85` |
| `DevinAdapter.createSession` | `(task, ctx)` | `Promise<AgentSession>` | `devin-adapter.ts:280` |
| `GitHubCopilotAdapter.createSession` | `(task, ctx)` | `Promise<AgentSession>` | `github-copilot-adapter.ts:161` |

## Fluxo Principal

1. Check active provider via `registry.getActive`; none → error. 🟢
2. `provider.hasCredentials`? If not, prompt; if unsaved → error. 🟢
3. Branch by provider:
   - **Devin** — build a referential prompt from spec artifacts → `Devin API createSession` → map to `AgentSession`, `providerSessionId = devin session id`. 🟢 `devin-adapter.ts:280`
   - **GitHub** — resolve repo id (GraphQL) → build issue body → create issue with `agentAssignment` → map to `AgentSession`, `providerSessionId = owner/repo#number`. 🟢 `github-copilot-adapter.ts:161`
4. `storage.create(session, status=PENDING)`. 🟢
5. Fire `onUpdated` → UI. 🟢

## Fluxos Alternativos

- **Credentials prompt cancelled:** error `CREDENTIALS_MISSING`; no session. 🟢
- **Create API failure:** `SESSION_CREATION_FAILED`; surfaced to caller. 🟢 (`ErrorCode`, `types.ts:271`)

## Dependências

- `provider-registry` (active provider), `agent-session-storage` (persist), the adapter's HTTP client (Devin REST / GitHub GraphQL). 🟢
- Spec artifacts (for the Devin referential prompt). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Provider id encodes the external id differently (Devin id vs `owner/repo#number`) | `flowcharts/cloud-agents.md` §1 | 🟢 |
| Referential prompt (links spec artifacts) for Devin rather than inlining content | `devin-adapter.ts` | 🟢 |

## Estado Interno

The created `AgentSession` is appended to the persisted session list. 🟢

## Observabilidade

Create + onUpdated logged via `logging.ts`. 🟢

## Riscos e Lacunas

- 🔴 Whether Devin session creation here vs the standalone `devin` module is the canonical path is undetermined (see `../questions.md`).
