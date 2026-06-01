# session-retention-cleanup (use-case)

> Use-case under `cloud-agents`. 7-day retention cleanup of cloud sessions.
> Source: `session-cleanup-service.ts`, `flowcharts/cloud-agents.md` §5.

## Visão Geral

Deletes cloud sessions older than a 7-day retention window (measured from completion), bounding `workspaceState` growth. 🟢

## Responsabilidades

- Compute the cutoff (`now - 7 days`). 🟢
- Find expired sessions and delete each. 🟢
- Log and return the deleted count. 🟢

## Regras de Negócio

- **R-CD-7** 7-day retention: completed sessions are cleaned up 7 days after completion. 🟢 `session-cleanup-service.ts:18,40`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Compute cutoff | Should | cutoff = `now - 7*24*60*60*1000` |
| RF-02 | Delete expired | Should | Sessions with completion older than cutoff are deleted |
| RF-03 | Report count | Should | Returns the number deleted (0 when none) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Escalabilidade | Bounds persisted session storage over time | `session-cleanup-service.ts:18` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado sessões cujo completedAt é anterior a now - 7 dias
Quando o cleanup roda
Então essas sessões são deletadas e a contagem é retornada

Dado nenhuma sessão expirada
Quando o cleanup roda
Então retorna 0 e nada é removido
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Cleanup (RF-01–RF-03) | Should | Hygiene; not on the critical path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `session-cleanup-service.ts` | `cleanup` (40), retention const (18) | 🟢 |
