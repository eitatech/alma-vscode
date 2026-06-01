# themed-primitives (use-case)

> Use-case under `webview-shared`. VS Code-themed UI primitives + shared utilities.
> Source: `components/ui/*`, `components/{icon,pill}-button.tsx`, `textarea-panel.tsx`, `lib/utils.ts`, `utils/relative-time.ts`, `flowcharts/webview-shared.md` §3–§5.

## Visão Geral

A set of presentational primitives mapping VS Code theme CSS variables — CVA `Button`, themed `VSCodeSelect`/`VSCodeCheckbox`, circular icon button, pill toolbar button, auto-grow `TextareaPanel` — plus shared utilities `cn` (class merge), `formatRelativeTime`, and `toFriendlyName`. 🟢

## Responsabilidades

- `Button` with CVA variants × sizes. 🟢
- `VSCodeSelect`/`VSCodeCheckbox` (label/required/error/indeterminate). 🟢
- `TextareaPanel` auto-grow via `useLayoutEffect` (scrollHeight). 🟢
- `cn`, `formatRelativeTime`, `toFriendlyName`. 🟢

## Regras de Negócio

- `cn = twMerge(clsx(...))`. 🟢 `lib/utils.ts:4`
- `formatRelativeTime`: <60 s `just now`; <60 m `Nm`; <24 h `Nh`; <7 d `Nd`; else `N wk`. 🟢 `relative-time.ts:16`
- `toFriendlyName`: basename → strip ext → strip `NNN-` → `-`/`_`→space → Title-Case. 🟢 `document-title-utils.ts`
- TextareaPanel resets height to `auto` then `scrollHeight` on each value change. 🟢 `textarea-panel.tsx:26`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Button (CVA) | Must | variants default/destructive/outline/secondary/ghost/link × size |
| RF-02 | Select/Checkbox | Must | label/required/desc/error; indeterminate; sizes |
| RF-03 | TextareaPanel | Should | auto-grow to scrollHeight |
| RF-04 | Utilities | Should | `cn`; `formatRelativeTime` thresholds; `toFriendlyName` |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Consistência | All map VS Code theme CSS variables | `components/ui/*` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um timestamp de 90 minutos atrás
Quando formatRelativeTime roda
Então retorna "1h ago" (RF-04)

Dado "012-agent-chat-panel.md"
Quando toFriendlyName roda
Então retorna "Agent Chat Panel" (RF-04)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Button + Select/Checkbox (RF-01, RF-02) | Must | Used across all webviews |
| Textarea + utils (RF-03, RF-04) | Should | Helpers |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `components/ui/button.tsx` | `Button` (37), `buttonVariants` | 🟢 |
| `components/ui/{vscode-select,vscode-checkbox}.tsx` | themed controls | 🟢 |
| `components/textarea-panel.tsx` | `TextareaPanel` (26) | 🟢 |
| `lib/utils.ts` / `utils/relative-time.ts` / `lib/document-title-utils.ts` | `cn` (4) / `formatRelativeTime` (12) / `toFriendlyName` | 🟢 |
