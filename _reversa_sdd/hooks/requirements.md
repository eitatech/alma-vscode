# hooks (module)

> Module-level `requirements.md`. Bounded context: **Automation**. Spec lineage: `011-custom-agent-hooks`.
> Source: `src/features/hooks/` (~11,190 LOC, 34 files — largest module). Complexity: high.
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`hooks` is the event-driven **automation engine**. A *Hook* binds a **trigger** (event source) + optional **conditions** + **schedule** to an **action**. When an SDD agent operation completes (or before it runs), matching hooks fire one of six action types: `agent`, `git`, `github` (via MCP), `mcp`, `custom`, `acp`. Includes `$variable` template substitution, MCP discovery/execution pooling, a multi-source agent registry, and `workspaceState` persistence. Completion is detected via filesystem watchers, not just command dispatch. 🟢

## Responsabilidades

- CRUD + persist hooks (`workspaceState`), with sync + async validation and schema migration on load. 🟢
- Detect operation completion via file watchers and fire triggers. 🟢
- Match enabled hooks by `agent` + `operation` + `timing`, in deterministic `createdAt` order. 🟢
- Execute a hook: availability pre-checks → conditions → schedule → action dispatch → log. 🟢
- Expand `$variable` templates with per-trigger gating. 🟢
- Guard execution chains (circular-dependency block + max depth 10). 🟢
- Discover + invoke MCP tools with bounded concurrency. 🟢

## Regras de Negócio

- **R-HK-1** A hook fires only when `agent` + `operation` + **same `timing`** match; matched hooks run in deterministic `createdAt` order. 🟢 `hook-executor.ts:835-858`
- **R-HK-2** **Blocking** execution only when `timing="before"` AND `waitForCompletion` set. 🟢 `hook-executor.ts:873-882`
- **R-HK-3** Chain safety: per-execution `executionId`, `executedHooks` set (circular block), `chainDepth` capped at `MAX_CHAIN_DEPTH=10`. 🟢 `hook-executor.ts:920-928`
- **R-HK-4** Action timeout default **30 s**; execution logs capped at **100** (FIFO); trigger history capped at **50**. 🟢 `types.ts:566-567,574`
- **R-HK-5** `$variableName`: missing/undefined → empty string; invalid name / `$`+space → syntax error; gated per trigger via `availableFor` (`[]` = all). 🟢 `template-variable-parser.ts:212-282`
- **R-HK-6** MCP discovery cache TTL **5 min**; execution concurrency capped at **5**; per-call timeout clamped 1 s–5 min. 🟢 `types.ts:577-581`
- **R-HK-7** "Completion" detected via filesystem watchers (e.g. `**/specs/*/spec.md`), parse-validate, **2 s debounce**. 🟢 `command-completion-detector.ts:27-72`
- **R-HK-8** `id` must be UUID v4; `name` unique ≤100 chars; immutable fields (`id`/`createdAt`/`executionCount`) cannot be updated; stored hooks migrated in place on load. 🟢 `hook-manager.ts:203,389-425`
- Persistence keys: hooks under `gatomia.hooks.configurations`; logs under `gatomia.hooks.execution-logs`. 🟢 `types.ts:570-571`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Hook CRUD + validation | Must | create/update/delete validate (sync + async MCP/agent), persist, emit change; immutable fields rejected (R-HK-8) |
| RF-02 | Completion detection | Must | A watched file matching an operation pattern fires a trigger after 2 s debounce (R-HK-7) |
| RF-03 | Trigger matching | Must | Enabled hooks matched by agent+operation+timing, sorted by createdAt (R-HK-1) |
| RF-04 | Blocking decision | Must | `before` + `waitForCompletion` blocks; else non-blocking (R-HK-2) |
| RF-05 | Single-hook pipeline | Must | enabled? → availability → conditions → schedule → dispatch → log |
| RF-06 | Six action types | Must | `agent`/`git`/`github`/`mcp`/`custom`/`acp` dispatch correctly |
| RF-07 | Template expansion | Must | `$var` substituted from context; missing → empty (R-HK-5) |
| RF-08 | Chain guard | Must | circular dependency + depth>10 blocked (R-HK-3) |
| RF-09 | Schema migration | Must | legacy `trigger`→`events`, default `timing=after`, `agentId`→`modelId` (R-HK-8) |
| RF-10 | MCP discovery/exec | Should | discover servers/tools (5-min TTL); execute with concurrency 5, clamped timeouts (R-HK-6) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Chain-cycle + depth guards prevent runaway hook chains | `hook-executor.ts:920-928` | 🟢 |
| Performance | MCP execution pool bounds concurrency at 5; discovery cached 5 min | `mcp-execution-pool.ts`; `types.ts:577` | 🟢 |
| Segurança | ACP/custom actions gated by availability pre-checks with user prompts | `hook-executor.ts` (availability) | 🟢 |
| Observabilidade | Every execution recorded to a FIFO log (max 100) with a context snapshot | `types.ts:472`; `hook-executor.ts:1259` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um hook habilitado para (speckit, specify, after)
Quando o arquivo specs/NNN/spec.md é criado e validado
Então após 2s o trigger dispara e a ação do hook é executada (R-HK-1, R-HK-7)

Dado um hook before com waitForCompletion
Quando o trigger dispara
Então a operação do agente aguarda a conclusão do hook (R-HK-2)

Dado um hook que dispararia a si mesmo
Quando a cadeia o reentra
Então a execução é bloqueada por CircularDependencyError (R-HK-3)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD, detect, match, pipeline, actions (RF-01–RF-06) | Must | The automation engine |
| Template + chain guard + migration (RF-07–RF-09) | Must | Correctness + safety + back-compat |
| MCP discovery/exec (RF-10) | Should | Powerful but a subset of actions |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `hook-executor.ts` | `executeHooksForTrigger` (823), `executeHook` (~245), chain guards (908-928), `expandTemplate` (1196) | 🟢 |
| `hook-manager.ts` | `createHook` (132), `validateHook` (500), `loadHooks`/`migrateHook` (355/389) | 🟢 |
| `trigger-registry.ts` | `fireTrigger` (57) | 🟢 |
| `template-variable-parser.ts` | `extractVariables`/`substitute`/`validateSyntax` (181/212/242) | 🟢 |
| `services/command-completion-detector.ts` | `initialize` (92) | 🟢 |
| `actions/*.ts` | per-type executors (acp/mcp/github/git/custom/agent) | 🟢 |
| `services/mcp-*.ts` | discovery/client/pool/parameter-resolver | 🟢 |

> See `contracts.md` (action params + trigger/operation taxonomy + variable catalog) and `questions.md` (🔴 `validateVariables` stub).
