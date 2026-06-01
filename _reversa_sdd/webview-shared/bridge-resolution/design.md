# bridge-resolution, Design Técnico

> HOW the bridge resolves. Source: `bridge/vscode.ts`, `flowcharts/webview-shared.md` §2.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `vscode` | resolved singleton | `{ postMessage, getState, setState }` | `bridge/vscode.ts:47` |

## Fluxo Principal (§2)

1. import `bridge/vscode` → `window.acquireVsCodeApi` is a function? 🟢
2. yes → `vscodeApi = window.acquireVsCodeApi()` (real postMessage/getState/setState). 🟢
3. no → dev fallback: `postMessage` echoes `openspec.chat/echoResult` after 50 ms; `getState → {}`; `setState → no-op`. 🟢
4. `export const vscode`. 🟢

## Algorithm

**Bridge resolution** — feature-detect `window.acquireVsCodeApi`; else install a self-echoing dev stub. Resolved once at import. 🟢

## Dependências

- `window.acquireVsCodeApi` (host-injected). 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Single resolution at import (acquireVsCodeApi callable once) | `bridge/vscode.ts:47` | 🟢 |
| Dev echo for out-of-VS-Code runs | `bridge/vscode.ts:18` | 🟢 |

## Estado Interno

The resolved `vscode` module singleton. 🟢

## Observabilidade

Echo responses in dev. 🟡

## Riscos e Lacunas

- 🟡 Echo target `openspec.chat/echoResult` is a residual from the `kiro-for-codex-ide` fork.
- 🟡 If any module calls `acquireVsCodeApi()` separately (e.g. `webview-spec-explorer`), the second call throws — they must never co-mount.
