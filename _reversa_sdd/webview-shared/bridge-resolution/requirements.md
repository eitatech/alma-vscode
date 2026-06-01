# bridge-resolution (use-case)

> Use-case under `webview-shared`. The shared VS Code postMessage bridge with a dev fallback.
> Source: `bridge/vscode.ts`, `flowcharts/webview-shared.md` §2.

## Visão Geral

Resolves the VS Code API once at import: if `window.acquireVsCodeApi` exists, uses the real `postMessage`/`getState`/`setState`; otherwise installs a self-echoing dev stub (echoes `openspec.chat/echoResult` after 50 ms; `getState→{}`, `setState→no-op`). 🟢

## Responsabilidades

- Feature-detect `window.acquireVsCodeApi`. 🟢
- Real → export the host channel; dev → export an echoing stub. 🟢
- Export the resolved `vscode` singleton. 🟢

## Regras de Negócio

- Resolved **once** at import. 🟢 `bridge/vscode.ts:47`
- Dev fallback: `postMessage` echoes `openspec.chat/echoResult` after 50 ms; `getState→{}`; `setState→no-op`. 🟢 `bridge/vscode.ts:18`
- `acquireVsCodeApi()` may be called only once per context (multiple calls throw). 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Resolve once | Must | single resolution at import; exported singleton |
| RF-02 | Real channel | Must | `window.acquireVsCodeApi` present → real postMessage/getState/setState |
| RF-03 | Dev fallback | Should | absent → echo stub (echoResult 50 ms; getState {}; setState no-op) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Testabilidade | Dev echo allows running the SPA outside VS Code | `bridge/vscode.ts:18` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado window.acquireVsCodeApi presente
Quando o bridge é importado
Então o canal real é exportado (RF-02)

Dado execução fora do VS Code
Quando o bridge é importado
Então o stub de echo é instalado (echoResult após 50ms) (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Resolve once + real channel (RF-01, RF-02) | Must | The host channel for all webviews |
| Dev fallback (RF-03) | Should | Local dev/testing |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `bridge/vscode.ts` | `vscode` (47), fallback (18) | 🟢 |

> 🟡 The echo target `openspec.chat/echoResult` is a fork residual; 🟡 `webview-spec-explorer` bypasses this bridge (R-X-6 drift, tracked there).
