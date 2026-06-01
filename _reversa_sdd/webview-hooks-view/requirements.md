# webview-hooks-view (module)

> Module-level `requirements.md`. Bounded context: **Presentation infra** (webview SPA).
> Source: `ui/src/features/hooks-view/`, `ui/src/components/{hooks,cli-options}/`, `ui/src/lib/mcp-utils.ts` (~8,680 LOC, ~42 files). Complexity: high (largest webview).
> Confidence: 🟢 CONFIRMED · 🟡 INFERRED · 🔴 GAP.

## Visão Geral

`webview-hooks-view` is the automation-hooks UI — the client of the extension-side `hooks`. It lets the user create/edit/toggle/delete hooks that fire before/after agent operations and run one of six action types (`agent`, `git`, `github`, `custom`, `mcp`, `acp`). Hosts the hook list, the multi-step form with per-action sub-forms, MCP discovery/selection, Copilot CLI option panels, ACP config, and the execution-logs panel. Uses a **dual-keyed** protocol (`type` + `command`) for backward compatibility. 🟢

## Responsabilidades

- Hook CRUD + toggle over the dual-keyed protocol. 🟢
- Render the hook list + the action-type-routed form. 🟢
- Discover MCP servers/tools, parse tool names, group by provider. 🟢
- Project execution status per hook; show execution logs. 🟢

## Regras de Negócio

- Dual-keyed protocol: send `command = type.replace(/\//g,'.')`; read `type ?? command`, `payload ?? data`. 🟢 `index.tsx:30,54`
- Form **not** reset on `hooks/sync` (avoids race); closes on cancel / save / delete. 🟢 `index.tsx:68`
- Create payload omits `id`/`createdAt`/`modifiedAt`/`executionCount` (host-assigned). 🟢 `types.ts:467`
- `waitForCompletion` only meaningful for `before` timing. 🟢 `types.ts:27`
- ACP execution mode is `local` only (v1). 🟢 `types.ts:202`
- MCP server-id extraction: ids never contain `_`; handle `.`/`/` notation. 🟢 `mcp-utils.ts:40`
- `groupToolsByProvider`: servers alpha by name, tools alpha by displayName; unknown-server selected tools → synthetic `Other`. 🟢 `use-mcp-servers.ts:232`
- `useMCPServers` auto-discovers on mount; `discover(true)` forces refresh. 🟢 `use-mcp-servers.ts:204`
- `hooks/execution-status` merges per `hookId` with fresh `updatedAt`. 🟢 `index.tsx:103`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | CRUD lifecycle | Must | ready/list → sync; toggle/delete/edit/create/update over dual-keyed protocol |
| RF-02 | Dual-keyed protocol | Must | send type+command; read `type ?? command`, `payload ?? data` |
| RF-03 | Action-type form routing | Must | 6 sub-forms by `action.type` |
| RF-04 | MCP discovery + grouping | Should | discover; parse tool names; group + Other |
| RF-05 | Execution status + logs | Should | per-hook status merge; logs panel |
| RF-06 | Create payload shape | Must | omit host-assigned fields on create |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Form not reset on sync (no edit-race) | `index.tsx:68` | 🟢 |
| Compatibilidade | Dual-keyed protocol tolerates both spellings | `index.tsx:30,54` | 🟡 |
| Resiliência | Discovery hooks carry loading/error state | `use-mcp-servers.ts:110` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o usuário cria um hook novo
Quando submete
Então hooks/create é enviado sem id/createdAt/modifiedAt/executionCount (RF-06)

Dado um tool "mcp_github_create_issue"
Quando agrupado
Então o servidor "github" é extraído e o tool listado sob ele (RF-04)

Dado action.type = github
Quando o form renderiza
Então o GitHubActionForm (11 operações) é exibido (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| CRUD + protocol + form routing + create shape (RF-01–RF-03, RF-06) | Must | Hook authoring |
| MCP + status/logs (RF-04, RF-05) | Should | Powerful action config + observability |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/hooks-view/index.tsx` | `HooksView` (14), `sendMessage` (29), exec-status merge (103) | 🟢 |
| `features/hooks-view/types.ts` | data model + dual-keyed unions | 🟢 |
| `components/hook-form.tsx` + action sub-forms | action-type routing | 🟢 |
| `lib/mcp-utils.ts` | `extractServerIdFromToolName` (40), `formatServerName` (129) | 🟢 |
| `hooks/use-mcp-servers.ts` | `useMCPServers` (110), `groupToolsByProvider` (232) | 🟢 |

> See `questions.md` for the 🔴 duplicate trigger-selector / cli-options components.
