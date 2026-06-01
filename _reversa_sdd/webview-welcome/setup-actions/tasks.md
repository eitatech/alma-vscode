# setup-actions, Tarefas de Implementação

## Pré-requisitos

- [ ] `webview-shared` bridge; the store (installing/refreshing flags)

## Tarefas

- [ ] T-01, Implement Setup section actions
  - Origem no legado: `components/setup-section.tsx`; `flowcharts/webview-welcome.md` §3
  - Critério de pronto: install one/missing/prerequisite; refresh (2 s clear)
  - Confiança: 🟢

- [ ] T-02, Implement Features / Config / Learn actions
  - Origem no legado: `components/{features,config,learning}-section.tsx`
  - Critério de pronto: execute-command; update-config + open settings; open-external/search
  - Confiança: 🟢

## Tarefas de Teste

- [ ] TT-01, Install missing sets flag + posts message (RF-01)
- [ ] TT-02, Config edit posts update-config (RF-04)
- [ ] TT-03, Refresh clears after 2 s (RF-02)

## Ordem Sugerida

1. T-01 → T-02.

## Lacunas Pendentes (🔴)

None.
