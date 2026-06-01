# orchestration-lanes, Design Técnico

> HOW the dashboard works. Source: `features/orchestration/index.tsx`, `flowcharts/webview-orchestration.md` §1–§2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `OrchestrationFeature` | `()` | JSX | `:79` |

## Fluxo Principal (§1)

1. mount → `addEventListener('message')` + `postMessage('orchestration/ready')`. 🟢
2. `orchestration/snapshot`? → `setSnapshot(payload ?? EMPTY_SNAPSHOT)` + `isLoading=false`. 🟢
3. group by bucket (`Object.fromEntries(BUCKETS.map(b => [b.key, sessions.filter(s => s.bucket===b.key)]))`). 🟢
4. `sessions.length == 0`? → derive empty-state → render EmptyState + action; else → 4 PanelSection lanes (StatusBadge count + SessionCard list). 🟢
5. actions: Open session → `orchestration/open-session`; Open original → `orchestration/open-existing-surface`; Open external → `orchestration/open-external`; Refresh → `orchestration/refresh`. 🟢

## Empty-state decision tree (§2)

First match over `degradedReasons` substrings + provider counts:
1. "provider wiring is unavailable" → Cloud unavailable → Open Agent Chat.
2. "No cloud agent providers are registered" → Connect provider → Open Cloud Agents.
3. "could not be read"/"Failed to read" → status unavailable → Refresh.
4. registry + providers>0 + no active → No provider selected → Open Cloud Agents.
5. registry + providers==0 → No sessions yet → Open Agent Chat.
6. fallback → No running/recent → Open Agent Chat. 🟢

## Dependências

- `webview-shared` `@/bridge/vscode`, `components/workflow` (PanelSection/StatusBadge/EmptyState). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Host pre-buckets; webview just groups | `orchestration/index.tsx:60` | 🟢 |
| Ordered predicate cascade for empty-state copy | `:112` | 🟢 |

## Estado Interno

`snapshot`, `isLoading`. 🟢

## Observabilidade

Degraded reasons drive the empty-state. 🟡

## Riscos e Lacunas

None. 🟢
