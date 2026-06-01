# orchestration-lanes (use-case)

> Use-case under `webview-orchestration`. The live MAESTRO dashboard: snapshot → bucketed lanes + degraded empty-state.
> Source: `features/orchestration/index.tsx`, `flowcharts/webview-orchestration.md` §1–§2.

## Visão Geral

On mount, handshakes `orchestration/ready`, ingests `orchestration/snapshot`, groups sessions into 4 bucket lanes (active/waiting/completed/failed), and — when empty — derives a degraded-mode empty-state from `degradedReasons` + provider availability. Session cards post open/external/refresh actions. 🟢

## Responsabilidades

- `ready` handshake + listen for `snapshot`. 🟢
- Group pre-bucketed sessions into 4 lanes. 🟢
- Compute the empty-state (first-match decision tree). 🟢
- Post session/header actions. 🟢

## Regras de Negócio

- Buckets `active`/`waiting`/`completed`/`failed`; sessions arrive pre-bucketed. 🟢 `orchestration/index.tsx:60,106`
- Empty-state first-match over `degradedReasons` + provider state. 🟢 `orchestration/index.tsx:112`
- `setSnapshot(payload ?? EMPTY_SNAPSHOT)`. 🟢 `flowcharts/webview-orchestration.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Ready + snapshot ingest | Must | `orchestration/ready` posted; `snapshot` sets state (fallback EMPTY) |
| RF-02 | Bucket lanes | Must | 4 PanelSection lanes with StatusBadge counts + SessionCards |
| RF-03 | Empty-state | Must | first-match decision tree → message + action button |
| RF-04 | Actions | Should | open-session / open-existing-surface / open-external / refresh posted |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Resiliência | Empty snapshot fallback; degraded messaging | `orchestration/index.tsx:60,112` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um snapshot vazio com degradedReasons "No cloud agent providers are registered"
Quando o empty-state é computado
Então "Connect a cloud provider" com "Open Cloud Agents" é mostrado (RF-03)

Dado sessões pré-bucketed
Quando renderizadas
Então caem nas 4 lanes corretas com contagens (RF-02)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Ready+snapshot+lanes+empty (RF-01–RF-03) | Must | The dashboard |
| Actions (RF-04) | Should | Navigation |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `features/orchestration/index.tsx` | `OrchestrationFeature` (79), buckets (60,106), empty-state (112) | 🟢 |
