# setup-actions, Design Técnico

> HOW section actions work. Source: `components/{setup,features,config,learning}-section.tsx`, `flowcharts/webview-welcome.md` §3.

## Action map (§3)

| Section | Action | Message |
|---------|--------|---------|
| Setup | Install one | `welcome/install-dependency(dependency)` |
| Setup | Install missing | set `isInstallingAll` + `welcome/install-missing-dependencies(deps)` |
| Setup | Install prerequisite | set `isInstallingAll` + `welcome/install-prerequisite(key)` |
| Setup | Refresh | set `isRefreshing` + `welcome/refresh-dependencies`; clear after 2 s |
| Features | command card | `welcome/execute-command(commandId, args)` |
| Config | edit | `welcome/update-config(key, value)` |
| Config | open settings | `welcome/execute-command(openSettings @ext:gatomia)` |
| Learn | link / search | `welcome/open-external(url)` / `welcome/search-resources(query)` |

All fire-and-forget; results return as `welcome/state` / `welcome/install-progress`. 🟢

## Dependências

- `webview-shared` bridge; the store (for installing/refreshing flags). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Fire-and-forget actions + host-pushed results | `flowcharts/webview-welcome.md` §3 | 🟢 |
| Optimistic install/refresh flags | setup-section | 🟢 |

## Estado Interno

`isInstallingAll`, `isRefreshing` (local + store). 🟢

## Observabilidade

install-progress events update the UI. 🟢

## Riscos e Lacunas

None. 🟢
