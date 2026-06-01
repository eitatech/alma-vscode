# User Story — Review and archive a spec

> Global cross-cutting flow (`doc_level=completo`). Confidence: 🟢 unless noted.

## História

**Como** mantenedor de specs,
**eu quero** enviar uma spec para revisão, registrar change requests, resolvê-los e arquivar,
**para que** o ciclo de vida da spec seja governado por regras claras e rastreáveis.

## Fluxo (cross-module)

1. Spec em `current`/`reopened` sem pendências → "Send to Review". → `spec/send-to-review-gating`, `spec/status-fsm` (carimba `completedAt`/`reviewEnteredAt`)
2. Revisor abre o Spec Explorer, vê as lanes (Current/Review/Archived/Changes). → `providers/spec-explorer-tree`, `webview-spec-explorer/spec-review-flow`
3. Revisor registra um change request (validação + dedup por título normalizado) → spec volta a `reopened`. → `webview-spec-explorer/change-request-form`, `spec/change-request-lifecycle` (R-SP-8)
4. Tasks anexadas ao CR (🔴 dispatch é mock hoje) → CR `inProgress`; todas concluídas → `addressed`. → `spec/change-request-lifecycle` (🔴 ver `spec/questions.md`)
5. Todos CRs addressed + tasks done + zero pendências → auto-retorno a `review`. → `spec/change-request-lifecycle` (R-SP-7)
6. Sem blockers → arquivar. → `spec/status-fsm` (R-SP-5)

## Critérios de Aceitação

```gherkin
Dado uma spec em current sem pendências
Quando envio para revisão
Então ela entra em review e completedAt/reviewEnteredAt são carimbados (R-SP-2, R-SP-3)

Dado uma spec em review com um change request aberto (archivalBlocker)
Quando tento arquivar
Então o arquivamento é bloqueado até o CR ser addressed (R-SP-5)
```

## Units envolvidas

`spec/{status-fsm,send-to-review-gating,change-request-lifecycle}`, `providers/spec-explorer-tree`, `webview-spec-explorer/{spec-review-flow,change-request-form}`, `tasks/*`.

> 🔴 O gerador real de tasks a partir de CR é um mock (`dispatchToTasksPrompt`) — ver `spec/questions.md` Q1.
