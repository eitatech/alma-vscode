# pr-state-task-sync, Design Técnico

> HOW PR merges update `tasks.md`. Source: `spec-status-updater.ts` (177), `flowcharts/devin.md` §6.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `updateSpecTaskStatusOnMerge` | `(specPath, specTaskId)` | `Promise<void>` | `spec-status-updater.ts:91` |
| `markTaskAsCompleted` | `(content, specTaskId)` | `string` (new content) | regex mutation — `:140` |

## Fluxo Principal

1. Poll detects a PR state change → emit `PrStateChangeEvent`. 🟢 `devin-polling-service.ts:397`
2. If `newState == merged` → `updateSpecTaskStatusOnMerge(specPath, specTaskId)`. 🟢
3. Read `tasks.md`; `markTaskAsCompleted` applies regex `^(- \[)( )(\] <id>\b)` → `[x]`. 🟢 `:140`
4. `workspace.fs.writeFile` only if the content changed (idempotent). 🟢
5. Else (non-merge) → record the new PR state only. 🟢

## Fluxos Alternativos

- **Task id not found in `tasks.md`:** no change written. 🟡
- **Already `[x]`:** regex no-ops; no write. 🟢

## Dependências

- `workspace.fs` (read/write `tasks.md`); the poller's PR-state detection. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Idempotent single-write checkbox mutation | `spec-status-updater.ts:140` | 🟢 |
| Only `merged` drives a task update (other states recorded only) | `flowcharts/devin.md` §6 | 🟢 |

## Estado Interno

Stateless transformation over `tasks.md` content. 🟢

## Observabilidade

PR-state events logged; `tasks.md` write logged. 🟡

## Riscos e Lacunas

- 🟡 PR review/approve/merge actions currently just open the browser; they do not mutate PR state via API (`pr-review-integration.ts:35,106`).
- 🔴 If `cloud-agents` also writes `tasks.md` on its own PR detection, two writers could double-toggle (see `../questions.md`).
