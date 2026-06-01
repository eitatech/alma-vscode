# themed-primitives, Tarefas de Implementação

## Pré-requisitos

- [ ] `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`, `@vscode/codicons`

## Tarefas

- [ ] T-01, Implement `Button` (CVA) + `VSCodeSelect`/`VSCodeCheckbox`
  - Origem no legado: `components/ui/button.tsx:37`; `vscode-select.tsx:35`; `vscode-checkbox.tsx:28`
  - Critério de pronto: variants × size; label/required/error; indeterminate
  - Confiança: 🟢

- [ ] T-02, Implement icon/pill buttons + `TextareaPanel`
  - Origem no legado: `components/{icon,pill}-button.tsx`; `textarea-panel.tsx:26`
  - Critério de pronto: circular/pill buttons; auto-grow to scrollHeight
  - Confiança: 🟢

- [ ] T-03, Implement utilities
  - Origem no legado: `lib/utils.ts:4`; `utils/relative-time.ts:12`; `lib/document-title-utils.ts`
  - Critério de pronto: `cn`; relative-time thresholds; `toFriendlyName`
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Button variants render (RF-01)
- [ ] TT-02, formatRelativeTime thresholds (RF-04)
- [ ] TT-03, toFriendlyName strips NNN- + title-cases (RF-04)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
