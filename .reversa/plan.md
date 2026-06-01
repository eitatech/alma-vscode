# Plano de Exploração — gatomia-vscode

> Criado pelo Reversa em 2026-05-08
> Marque cada tarefa com ✅ quando concluída.
> Você pode editar este plano antes de iniciar: adicione, remova ou reordene tarefas conforme necessário.

---

## Fase 1: Reconhecimento 🔍

- [x] ✅ **Scout** — Mapeamento de estrutura de pastas e tecnologias
- [x] ✅ **Scout** — Análise de dependências e gerenciadores de pacotes
- [x] ✅ **Scout** — Identificação de entry points, CI/CD e configurações

## Decisão de organização das specs 🗂️

> Entre o Scout e o Arqueólogo, o Reversa pergunta como você quer organizar as specs (por módulo, caso de uso, endpoint, híbrida, por features ou customizada). A escolha fica persistida em `.reversa/config.toml` na seção `[specs]` e não será reperguntada em execuções futuras. Para reapresentar o menu, remova manualmente a seção.

## Fase 2: Escavação 🏗️

> Repreenchido pelo Scout em 2026-05-28 (re-execução limpa) a partir de `.reversa/context/surface.json`. 22 módulos identificados (15 na extensão + 7 no webview).

### Extensão (`src/`)

- [x] ✅ **Arqueólogo** — Análise do módulo `agent-chat`
- [x] ✅ **Arqueólogo** — Análise do módulo `agents`
- [x] ✅ **Arqueólogo** — Análise do módulo `cloud-agents`
- [x] ✅ **Arqueólogo** — Análise do módulo `devin`
- [x] ✅ **Arqueólogo** — Análise do módulo `hooks`
- [x] ✅ **Arqueólogo** — Análise do módulo `orchestration`
- [x] ✅ **Arqueólogo** — Análise do módulo `spec`
- [x] ✅ **Arqueólogo** — Análise do módulo `steering`
- [x] ✅ **Arqueólogo** — Análise do módulo `tasks`
- [x] ✅ **Arqueólogo** — Análise do módulo `providers`
- [x] ✅ **Arqueólogo** — Análise do módulo `services`
- [x] ✅ **Arqueólogo** — Análise do módulo `panels`
- [x] ✅ **Arqueólogo** — Análise do módulo `commands`
- [x] ✅ **Arqueólogo** — Análise do módulo `utils`
- [x] ✅ **Arqueólogo** — Análise do módulo `prompts`

### Webview (`ui/src/`)

- [x] ✅ **Arqueólogo** — Análise do módulo `webview-agent-chat`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-spec-explorer`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-hooks-view`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-orchestration`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-preview`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-welcome`
- [x] ✅ **Arqueólogo** — Análise do módulo `webview-shared`

## Fase 3: Interpretação 🧠

- [x] ✅ **Detetive** — Arqueologia Git e ADRs retroativos
- [x] ✅ **Detetive** — Regras de negócio implícitas e máquinas de estado
- [x] ✅ **Detetive** — Matriz de permissões (RBAC/ACL)
- [x] ✅ **Arquiteto** — Diagramas C4 (Contexto, Containers, Componentes)
- [x] ✅ **Arquiteto** — ERD completo e integrações externas
- [x] ✅ **Arquiteto** — Spec Impact Matrix

## Fase 4: Geração 📝

- [x] ✅ **Redator** — Specs SDD por componente (22 módulos, layout hybrid, ~306 arquivos de unit)
- [x] ✅ **Redator** — OpenAPI (n/a — a extensão não serve API HTTP; consome Devin REST + GitHub GraphQL, documentado em contracts.md)
- [x] ✅ **Redator** — User Stories (6 fluxos cross-cutting)
- [x] ✅ **Redator** — Code/Spec Matrix

## Fase 5: Revisão ✅

- [x] ✅ **Revisor** — Revisão cruzada de specs (estrutura, matrizes, cross-ref; resolução em código de todos os gaps determináveis)
- [x] ✅ **Revisor** — Resolução de lacunas com o usuário (10 gaps distintos resolvidos em chat com Italo)
- [x] ✅ **Revisor** — Relatório de confiança final (`confidence-report.md` + `gaps.md`; confiança geral ≈ 87.8%)

---

## Agentes Independentes

> Execute estes agentes quando os recursos estiverem disponíveis — podem rodar em qualquer fase.

- [x] ✅ **Visor** — Análise de interface via screenshots (GatomIA sidebar: 8 tree views documentados → `ui/inventory.md`, `ui/flow.md`, `providers/screens.md`)
- [ ] **Data Master** — Análise completa do banco de dados
- [ ] **Design System** — Extração de tokens de design
- [ ] **Tracer** — Análise dinâmica (requer sistema acessível)

---

## Próximo passo

Após o Time de Descoberta concluir e o `_reversa_sdd/` estar populado, você pode disparar um dos fluxos seguintes:

- `/reversa-migrate`: orquestrador do **Time de Migração** (Paradigm Advisor → Curator → Strategist → Designer → Inspector). Gera as specs do sistema novo. Saída em `_reversa_sdd/migration/`.
- `/reversa-reconstructor`: gera plano bottom-up para reimplementar o software a partir das specs do legado (uma tarefa por sessão).
