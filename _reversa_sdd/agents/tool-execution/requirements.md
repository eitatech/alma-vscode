# tool-execution (use-case)

> Use-case under `agents`. Named tool handler validation, execution, timing, and error wrapping.
> Source: `tool-registry.ts`, `error-formatter.ts`, `flowcharts/agents.md` §3.

## Visão Geral

The tool registry maps tool names to handlers. On execution it validates the name/params, looks up the handler, runs it with timing, and on failure wraps + formats the error into actionable output. Registration enforces unique, well-formed names. 🟢

## Responsabilidades

- Register named handlers, rejecting malformed or duplicate names. 🟢
- Execute a tool by name with a `ToolExecutionContext`, timing the run. 🟢
- Return a `ToolResponse` (content + optional files + metadata incl. duration). 🟢
- Wrap handler failures as `ToolExecutionError`, then categorize/sanitize/format. 🟢

## Regras de Negócio

- Tool name `^[a-z0-9.-]+$`; duplicate registration throws. 🟢 `tool-registry.ts:25,40,47`
- Missing handler at execute time throws with the available-tools list. 🟢 `flowcharts/agents.md` §3
- 6 error categories; messages sanitized (paths stripped, 200-char cap); severity by category. 🟢 `error-formatter.ts:12,270,294`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Register handler with name validation | Must | `register(name, handler)` rejects bad names; duplicates throw |
| RF-02 | Execute with timing | Must | `execute(name, params, ctx)` runs the handler and records duration in metadata |
| RF-03 | Missing-handler error | Must | Executing an unknown tool throws listing available tools |
| RF-04 | Error wrapping + formatting | Should | Handler throw → `ToolExecutionError` → `FormattedError` with category + guidance |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Observabilidade | Execution duration captured in `ToolResponse.metadata`; error severity logged | `tool-registry.ts:67`; `error-formatter.ts:294` | 🟢 |
| Segurança | Error output sanitizes paths and caps length | `error-formatter.ts:270` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado um tool registrado com nome válido e único
Quando ele é executado com params válidos
Então o handler roda, a duração é registrada em metadata e um ToolResponse é retornado

Dado um nome de tool já registrado
Quando um segundo registro com o mesmo nome ocorre
Então o registro lança erro

Dado um tool cujo handler lança
Quando ele é executado
Então o erro é envolvido em ToolExecutionError e formatado com categoria + guidance
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Register + execute + missing-handler (RF-01, RF-02, RF-03) | Must | Core of command behavior |
| Error wrapping (RF-04) | Should | UX quality, off the happy path |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `tool-registry.ts` | `register` (38), `execute` (67), name check (25,40,47) | 🟢 |
| `error-formatter.ts` | `formatError` (49) | 🟢 |
| `tools/example-tool-handler.ts`, `tools/help-handler.ts` | sample handlers | 🟢 |
