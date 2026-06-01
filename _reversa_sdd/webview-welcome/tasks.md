# webview-welcome (module), Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; `zustand`; React 18
- [ ] `requirements.ts` kept in sync with `src/services/welcome/requirements.ts` (parity test)

## Tarefas

- [ ] T-01, Define `types.ts` (state model + messages)
  - Origem no legado: `types.ts`
  - Critério de pronto: IdeHost/DependencyStatus/ConfigurationState/diagnostics/messages compile
  - Confiança: 🟢

- [ ] T-02, Implement Zustand store
  - Origem no legado: `stores/welcome-store.ts:75,135`
  - Critério de pronto: lifecycle state; updateConfig; diagnostics ≤5; view/preferences
  - Confiança: 🟢

- [ ] T-03, Implement `WelcomeScreen` + ErrorBoundary + routing
  - Origem no legado: `welcome-screen.tsx:29,70,98,117`
  - Critério de pronto: single-init; `welcome/ready`; message routing; loading/error UI
  - Confiança: 🟢

- [ ] T-04, Implement `computeRequirementProfile`
  - Origem no legado: `requirements.ts:22,48,67,89`
  - Critério de pronto: host-aware required/optional/hidden; missing + install-order sort
  - Confiança: 🟢

- [ ] T-05, Implement the 5 section panels
  - Origem no legado: `components/{setup,features,config,status,learning}-section.tsx`
  - Critério de pronto: setup actions; feature cards; config edit; status; learn search
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, StrictMode double-mount → ready once (RF-01)
- [ ] TT-02, windsurf profile hides copilot-chat (RF-05)
- [ ] TT-03, no spec system → speckit in missing (RF-05)
- [ ] TT-04, diagnostics capped at 5 (RF-02)

## Ordem Sugerida

1. T-01 → T-02 → T-03 → T-04 → T-05.

## Lacunas Pendentes (🔴)

None. 🟡 keep `requirements.ts` in sync with the extension copy.
