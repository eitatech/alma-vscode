# hooks-crud, Tarefas de Implementação

## Pré-requisitos

- [ ] `types.ts` (dual-keyed unions); `webview-shared` bridge

## Tarefas

- [ ] T-01, Implement dual-keyed `sendMessage` + receive
  - Origem no legado: `index.tsx:29-30,54`
  - Critério de pronto: send type+command; read `type ?? command`, `payload ?? data`
  - Confiança: 🟢

- [ ] T-02, Implement CRUD lifecycle + sync handling
  - Origem no legado: `index.tsx:14,68`
  - Critério de pronto: ready/list → sync → list/form; toggle/delete/edit/create/update; form not reset on sync
  - Confiança: 🟢

- [ ] T-03, Implement exec-status + logs + error
  - Origem no legado: `index.tsx:103`
  - Critério de pronto: status merge by hookId; logs panel; error formatting
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Create omits host-assigned fields (RF-03)
- [ ] TT-02, sync doesn't reset open form (RF-01)
- [ ] TT-03, dual-keyed read works for both spellings (RF-05)

## Ordem Sugerida

1. T-01 → T-02 → T-03.

## Lacunas Pendentes (🔴)

None.
