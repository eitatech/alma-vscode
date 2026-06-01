# setup-actions (use-case)

> Use-case under `webview-welcome`. Fire-and-forget setup/config/feature/learn actions to the host.
> Source: `components/{setup,features,config,learning}-section.tsx`, `flowcharts/webview-welcome.md` §3.

## Visão Geral

The section panels post fire-and-forget `welcome/*` messages to the host (install one/missing/prerequisite, refresh, execute-command, update-config, open-external/search); results return as `welcome/state` / `welcome/install-progress` updates. 🟢

## Responsabilidades

- Setup: install one dependency / install missing / install prerequisite / refresh. 🟢
- Features: `welcome/execute-command(commandId, args)`. 🟢
- Config: `welcome/update-config(key, value)`; open settings. 🟢
- Learn: `welcome/open-external(url)` / `welcome/search-resources(query)`. 🟢

## Regras de Negócio

- Install-missing / install-prerequisite set `isInstallingAll` (cleared by host finish event). 🟢 `flowcharts/webview-welcome.md` §3
- Refresh sets `isRefreshing`, cleared after 2 s. 🟢
- All actions are fire-and-forget postMessages; state returns via `welcome/state`. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Install actions | Must | one → `install-dependency`; missing → `install-missing-dependencies`; prereq → `install-prerequisite` |
| RF-02 | Refresh | Should | `refresh-dependencies`; `isRefreshing` cleared after 2 s |
| RF-03 | Execute command | Should | features → `execute-command(commandId, args)` |
| RF-04 | Update config | Should | config edit → `update-config(key, value)`; open settings |
| RF-05 | Learn | Should | `open-external` / `search-resources` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Responsividade | Optimistic installing/refreshing flags while host works | `flowcharts/webview-welcome.md` §3 | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o usuário clica "Install missing"
Quando a ação dispara
Então isInstallingAll=true e welcome/install-missing-dependencies é postado (RF-01)

Dado o usuário edita uma config
Quando o valor muda
Então welcome/update-config(key, value) é postado (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Install actions (RF-01) | Must | Onboarding core |
| Refresh/command/config/learn (RF-02–RF-05) | Should | Supporting actions |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `components/setup-section.tsx` | install/refresh actions | 🟢 |
| `components/features-section.tsx` | execute-command cards | 🟢 |
| `components/config-section.tsx` | update-config / open settings | 🟢 |
| `components/learning-section.tsx` | open-external / search | 🟢 |
