# new-session-panel (use-case)

> Use-case under `panels`. The lightweight New Agent Session picker with self-dispose handoff.
> Source: `new-session-panel.ts`, `flowcharts/panels.md` §4.

## Visão Geral

A lightweight agent/task picker panel (`gatomia.agentChat.newSession`) that broadcasts available providers, and on a `new-session/start` payload runs `onStart` and then always disposes — handing off to the real Agent Chat panel. 🟡 may be superseded by the sidebar composer (see `questions.md`). 🟢

## Responsabilidades

- Open (throws if already disposed); reveal if a panel exists. 🟢
- Subscribe to registry updates → broadcast providers (`new-session/providers`). 🟢
- On `new-session/start` payload → `onStart(payload)` → finally dispose. 🟢

## Regras de Negócio

- Reopening after dispose throws. 🟢 `new-session-panel.ts:103`
- Self-disposes after every start attempt (success or failure). 🟢 `new-session-panel.ts:199-204`
- Ships a minimal HTML stub (React view wired separately). 🟡 `new-session-panel.ts`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Open / reveal | Must | disposed → throw; existing → reveal; else create + broadcast providers |
| RF-02 | Provider broadcast | Should | registry update → `new-session/providers` posted |
| RF-03 | Start + handoff | Must | valid start payload → `onStart` → finally dispose |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Testabilidade | DI via `NewSessionPanelDeps` | `new-session-panel.ts` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o NewSessionPanel aberto
Quando o usuário envia new-session/start válido
Então onStart roda e o painel se autodescarta (handoff)

Dado um painel já descartado
Quando open() é chamado
Então lança "cannot open disposed"
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Open + start handoff (RF-01, RF-03) | Must | The picker → chat handoff |
| Provider broadcast (RF-02) | Should | Picker content |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `new-session-panel.ts` | `open` (103), `handleStart` (193), self-dispose (199-204) | 🟢 |

> 🟡 May be superseded by `agent-chat-view-provider`'s composer — see `../questions.md`.
