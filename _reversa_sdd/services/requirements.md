# services (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra / core logic**.
> Source: `src/services/` (incl. `acp/`, `welcome/`) (~5,974 LOC, 22 files). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`services` is the **core business-logic layer** beneath `providers`/`panels`/`commands`. Three subsystems dominate: (1) the **ACP runtime** (`acp/`) — the Agent Client Protocol client that spawns local agent CLIs over stdio JSON-RPC and powers `agent-chat`; (2) the **chat-dispatch pipeline** (`chat-router` → `chat-dispatcher` → ACP or Copilot Chat fallback) plus `agent-service`; (3) the **document preview/refinement** subsystem and **welcome-screen support services**. `prompt-loader` and `configuration-service` are cross-cutting. 🟢

## Responsabilidades

- Spawn + drive ACP CLI subprocesses; implement the SDK `Client` handler. 🟢
- Resolve permissions (mode + remembered decisions) and gate buffered file writes. 🟢
- Route chat to ACP vs Copilot (host/probe-based, cached) and dispatch with slash-rewrite. 🟢
- Register `.agent.md` chat participants (via `agents`); hot-reload resources. 🟢
- Load/render Handlebars prompts; preview/refine documents; detect dependencies. 🟢

## Regras de Negócio

- **R-X-5** One `AcpClient` subprocess per `(providerId, cwd)` (worktree isolation); session keys `_ws_` / `spec:<id>` / `once:<uuid>`; `npx` spawns gated by a one-time consent per `(providerId, cwd)`. 🟢 `acp-session-manager.ts:84,201-225,387-398`
- `once:` sessions deleted after the turn / on cancel. 🟢 `acp-client.ts:483,512`
- `writeTextFile` buffered for approval when `bufferFileWrites` (else direct write); rejection surfaced to the agent. 🟢 `acp-client.ts:942-960`
- `requestPermission` honors mode + remembers `allow_always`/`reject_always` per `ToolKind` for the client lifetime. 🟢 `acp-client.ts:316,1510`
- **R-X-4** ACP dispatch rewrites a leading `/command` into natural language. 🟢 `chat-dispatcher.ts:38-61`
- **R-X-2** Copilot Chat `files` param only on VS Code ≥ 1.95.0. 🟢 `chat-dispatcher.ts:126-138`
- Routing: `gatomia.chat.provider` override; ACP disabled in remote workspaces; auto by host + probe (installed→acpSupported→authenticated). 🟢 `chat-router.ts:71-108`
- Remote ACP registry cached 24 h, 3 s fetch timeout; entries metadata-only until a spawn command exists. 🟢 `acp-provider-registry.ts:5-9`
- `setSessionModel` uses experimental `unstable_setSessionModel`; missing ⇒ `ACP_NOT_SUPPORTED` (caller downgrades). 🟢 `acp-client.ts:818-845`
- Refinement maps doc type → SpecKit command (default `/speckit.clarify`). 🟢 `refinement-gateway.ts:27-39`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | ACP client lifecycle | Must | `ensureStarted` coalesces; spawn → initialize; exit rejects waiters + clears sessions |
| RF-02 | Send prompt + dispatch updates | Must | create-on-demand session; `connection.prompt`; route session-update kinds |
| RF-03 | Permission resolution | Must | allow/deny short-circuit; ask → remembered/prompt; persist "always" per ToolKind |
| RF-04 | Buffered write approval | Must | `bufferFileWrites` → PendingWrite → Accept/Reject → write/reject RPC |
| RF-05 | Chat routing | Must | override / remote-off / auto-probe → {acp, copilot-chat}, 60 s cache |
| RF-06 | Slash rewrite + fallback | Must | `/cmd` rewritten for ACP; ACP throw → invalidate + Copilot fallback (R-X-4) |
| RF-07 | Document refinement | Should | doc type → SpecKit cmd; refine/update prompt → chat |
| RF-08 | Prompt rendering | Must | validate required frontmatter vars before Handlebars render |
| RF-09 | Dependency detection | Should | TTL-cached install/version probing |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | npx spawns + global writes gated by consent/approval | `acp-session-manager.ts:201`; `acp-client.ts:942` | 🟢 |
| Disponibilidade | Startup-timeout race fails fast on stuck initialize | `acp-client.ts` (`withStartupTimeout`) | 🟢 |
| Performance | Routing decision cached 60 s; registry cached 24 h | `chat-router.ts:159`; `acp-provider-registry.ts:5` | 🟢 |
| Confiabilidade | ACP throw → graceful Copilot fallback | `chat-dispatcher.ts:83` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado bufferFileWrites ativo e um writeTextFile do agente
Quando o agente escreve
Então um PendingWrite é enfileirado e a RPC só resolve após Accept (ou rejeita no Reject)

Dado um prompt iniciando com /speckit.plan roteado para ACP
Quando despachado
Então o /comando é reescrito em linguagem natural antes do envio (R-X-4)

Dado o ACP indisponível em runtime (throw)
Quando o dispatch falha
Então o cache é invalidado e o Copilot Chat assume (fallback)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| ACP lifecycle + dispatch + permission + write (RF-01–RF-04) | Must | Powers agent-chat |
| Routing + rewrite + fallback (RF-05, RF-06) | Must | Chat entry point |
| Refinement + prompts + deps (RF-07–RF-09) | Should | Supporting services |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `acp/acp-client.ts` | `ensureStarted` (433), `sendPrompt` (453), `createSession` (706), `buildClientHandler` (888), `resolvePermission` (1510) | 🟢 |
| `acp/acp-session-manager.ts` | `send` (156), `sendPromptDirect` (173) | 🟢 |
| `chat-router.ts` / `chat-dispatcher.ts` | `resolve` (51) / `dispatch` (83), `rewritePromptForAcp` (38) | 🟢 |
| `refinement-gateway.ts` | `submitRequest` (105) | 🟢 |
| `prompt-loader.ts` | `renderPrompt` (157) | 🟢 |
| `document-preview-service.ts` | `loadDocument` (80) | 🟢 |
| `dependency-checker.ts`, `acp/acp-provider-registry.ts` | dep probe / registry | 🟢 |

> See `contracts.md` for the ACP `Client` handler + protocol + the ACP Registry CDN.
