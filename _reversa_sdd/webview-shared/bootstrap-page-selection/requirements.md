# bootstrap-page-selection (use-case)

> Use-case under `webview-shared`. Single-bundle entry + runtime `data-page` routing.
> Source: `index.tsx`, `page-registry.tsx`, `flowcharts/webview-shared.md` §1.

## Visão Geral

One Vite bundle boots via `index.tsx`, reads the host-set `data-page` from `#root` (default `simple`), and resolves it to a lazy/code-split feature renderer via `getPageRenderer` — rendering "Unknown page" for unregistered values. 🟢

## Responsabilidades

- `createRoot(#root)`; read `container.dataset.page` (default `simple`). 🟢
- `getPageRenderer(pageName)` → lazy feature (withSuspense) or undefined. 🟢
- Render the renderer or a visible "Unknown page". 🟢

## Regras de Negócio

- Active page from `#root[data-page]`, default `simple`. 🟢 `index.tsx:10`
- Unknown page → "Unknown page: <name>" (no throw). 🟢 `index.tsx:16`; `page-registry.tsx:108`
- 11 registered pages; `getPageRenderer` returns undefined for unknown. 🟢 `page-registry.tsx:107`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Bootstrap | Must | `createRoot`; data-page read (default simple) |
| RF-02 | Page resolution | Must | `getPageRenderer` → withSuspense(lazy import) |
| RF-03 | Unknown fallback | Must | unregistered → "Unknown page", no throw |
| RF-04 | Code splitting | Should | per-page lazy chunk loads on demand |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Performance | Per-page code splitting | `page-registry.tsx:107` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado #root[data-page="welcome-screen"]
Quando index.tsx carrega
Então o renderer lazy de welcome-screen é montado (RF-02)

Dado data-page="devin-progress" (não registrado)
Quando index.tsx carrega
Então "Unknown page: devin-progress" é exibido (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Bootstrap + resolution + fallback (RF-01–RF-03) | Must | Entry for every page |
| Code splitting (RF-04) | Should | Bundle perf |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `index.tsx` | bootstrap (10,16) | 🟢 |
| `page-registry.tsx` | `getPageRenderer` (107), pages, unknown (108) | 🟢 |

> 🔴 `devin-progress`/`cloud-agent-progress` requested by panels but not registered — see `../questions.md`.
