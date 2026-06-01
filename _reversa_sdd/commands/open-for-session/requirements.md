# open-for-session (use-case)

> Use-case under `commands`. `gatomia.agentChat.openForSession` — reopen with restart hydration + one-panel reuse.
> Source: `agent-chat-commands.ts`, `flowcharts/commands.md` §2.

## Visão Geral

Opens the Agent Chat panel for an existing session, lazily hydrating the registry from the store after a restart, and honoring one-panel-per-session by reusing an existing panel (`focusPanel`) rather than creating a duplicate. 🟢

## Responsabilidades

- Resolve the session from the registry; fall back to the store (restart). 🟢
- Lazily register a store-only session into the registry (T047 hydrate). 🟢
- `focusPanel` reuse if a panel exists (emit `PANEL_REOPENED`); else create + attachPanel + reveal. 🟢

## Regras de Negócio

- Restart hydration: registry miss → store lookup → `registerSession`. 🟢 `agent-chat-commands.ts:297-313`
- One-panel-per-session: `focusPanel` reuse (FR-008). 🟢 `flowcharts/commands.md` §2
- Not found in store → no-op return. 🟢

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Registry → store fallback | Must | registry miss → store; store miss → return |
| RF-02 | Lazy hydrate | Must | store-only session registered before panel ops |
| RF-03 | Panel reuse | Must | existing panel → focusPanel + `PANEL_REOPENED`; else create + attachPanel + reveal |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Robustez | Survives extension restart (store-backed hydrate) | `agent-chat-commands.ts:297-313` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado uma sessão presente apenas no store (após reload)
Quando openForSession é chamado
Então a sessão é hidratada no registry e o painel é aberto (RF-01, RF-02)

Dado um painel já aberto para a sessão
Quando openForSession é chamado
Então o painel é reutilizado (focusPanel) e PANEL_REOPENED é emitido (RF-03)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Fallback + hydrate + reuse (RF-01–RF-03) | Must | Reopen correctness across restart |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `agent-chat-commands.ts` | `handleOpenForSession` (284,297-313), `coerceSessionIdArg` (708) | 🟢 |
