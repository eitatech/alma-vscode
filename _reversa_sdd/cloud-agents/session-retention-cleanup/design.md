# session-retention-cleanup, Design Técnico

> HOW retention cleanup works. Source: `session-cleanup-service.ts` (~), `flowcharts/cloud-agents.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `SessionCleanupService.cleanup` | `()` | `Promise<number>` | returns deleted count — `:40` |

## Fluxo Principal

1. `cutoff = now - 7 days` (retention const at `:18`). 🟢
2. Query expired sessions (completion timestamp < cutoff). 🟢
3. If none → return 0. 🟢
4. Delete each expired session from storage; log the count; return it. 🟢

## Fluxos Alternativos

- **Active/non-terminal sessions:** excluded (only completed/expired are eligible). 🟡 confirm the exact eligibility predicate in `session-cleanup-service.ts:40`.

## Dependências

- `agent-session-storage` (delete). 🟢
- Triggered on activation and/or interval. 🟡

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Fixed 7-day retention window | `session-cleanup-service.ts:18` | 🟢 |

## Estado Interno

Stateless aside from the storage it mutates. 🟢

## Observabilidade

Logs the deleted count. 🟢

## Riscos e Lacunas

- 🟡 Confirm whether cleanup keys off `completedAt` or `updatedAt`.
