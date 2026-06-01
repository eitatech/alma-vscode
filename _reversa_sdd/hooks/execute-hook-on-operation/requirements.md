# execute-hook-on-operation (use-case)

> Use-case under `hooks`. Completion detection → trigger → single-hook execution pipeline → action.
> Source: `command-completion-detector.ts`, `hook-executor.ts`, `actions/*`, `flowcharts/hooks.md` §1–§2 + §4.

## Visão Geral

When an SDD agent operation completes, a filesystem watcher detects it, fires a trigger, and the executor runs each matched hook through the pipeline: enabled check → availability pre-check → conditions → schedule → dispatch one of six action types → record an execution log. 🟢

## Responsabilidades

- Detect completion (watcher + parse-validate + 2 s debounce) and fire the trigger. 🟢
- Run the single-hook pipeline with availability pre-checks (MCP/custom) that may prompt the user. 🟢
- Evaluate conditions; honor schedule (immediate/delayed). 🟢
- Expand templates and dispatch the action (`agent`/`git`/`github`/`mcp`/`custom`/`acp`). 🟢
- Record an execution log (FIFO max 100) with success/failure/timeout. 🟢

## Regras de Negócio

- **R-HK-7** Completion via watchers (e.g. `**/specs/*/spec.md`), parse-validate, 2 s debounce. 🟢 `command-completion-detector.ts:27-72`
- **R-HK-4** Action timeout 30 s; logs FIFO max 100. 🟢 `hook-executor.ts:1259-1265`
- **R-HK-5** Template `$var`: missing → empty; invalid → syntax error. 🟢 `template-variable-parser.ts:212`
- Disabled hook → status `skipped`; conditions not met → `skipped`. 🟢 `flowcharts/hooks.md` §2
- ACP action lifecycle: `PENDING → SPAWNING → HANDSHAKE → SESSION_CREATED → PROMPTING → COLLECTING → DONE/TIMEOUT/ERROR`. 🟢 `actions/acp-action.ts`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Completion detection fires trigger | Must | A watched file matching the pattern fires after 2 s debounce (R-HK-7) |
| RF-02 | Enabled + condition gates | Must | disabled or unmet conditions → `skipped` |
| RF-03 | Availability pre-check | Must | MCP invalid → prompt "Update Hook"; custom agent unavailable → prompt Retry/Update |
| RF-04 | Schedule | Should | `delayed` awaits `delayMs`; `immediate` proceeds |
| RF-05 | Action dispatch | Must | correct executor per `action.type`; result status captured |
| RF-06 | Execution log | Must | log recorded FIFO (max 100) with context snapshot + status |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Confiabilidade | Action timeout (30 s) bounds a hung action | `types.ts:566`; `hook-executor.ts` | 🟢 |
| Observabilidade | Every execution logged with a snapshot of the template context | `types.ts:472` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um hook habilitado para (speckit, specify, after) com ação git commit
Quando specs/NNN/spec.md é gravado e validado
Então após 2s o hook executa: condições avaliadas, template expandido, commit disparado, log gravado

Dado um hook com ação MCP cuja referência de servidor é inválida
Quando o hook executa
Então o usuário é solicitado a "Update Hook" e a execução não prossegue
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Detection + pipeline + dispatch + log (RF-01–RF-06) | Must | The end-to-end automation path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `services/command-completion-detector.ts` | `initialize` (92), `handleFileChange` | 🟢 |
| `hook-executor.ts` | `executeHook` (~245), `expandTemplate` (1196), log (1259) | 🟢 |
| `actions/*.ts` | acp/mcp/github/git/custom/agent executors | 🟢 |
