# tool-execution, Design Técnico

> HOW tools are registered and run. Source: `tool-registry.ts` (242), `error-formatter.ts` (308), `flowcharts/agents.md` §3.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `ToolRegistry.register` | `(name: string, handler)` | `void` | name `^[a-z0-9.-]+$`, unique — `:38` |
| `ToolRegistry.execute` | `(name, params, ctx: ToolExecutionContext)` | `Promise<ToolResponse>` | timed — `:67` |
| `formatError` | `(error, context?)` | `FormattedError` | categorize+sanitize — `error-formatter.ts:49` |

### `ToolResponse` (`types.ts:149`)
`{ content: string; files?: FileReference[]; metadata?: { durationMs, ... } }`

## Fluxo Principal

1. **register** — validate name `^[a-z0-9.-]+$`; reject duplicates (throw). 🟢 `:25,40,47`
2. **execute** — validate params; look up handler. 🟢 `:67`
3. If handler missing → throw with the available-tools list. 🟢 `flowcharts/agents.md` §3
4. Run handler with start/stop timing; on success attach `durationMs` to `ToolResponse.metadata`. 🟢
5. On handler throw → wrap as `ToolExecutionError{tool, cause}` → `formatError`: type dispatch → categorize (1 of 6) → sanitize (strip paths, cap 200) → attach actionable guidance → log severity + telemetry → rethrow/return. 🟢 `error-formatter.ts:12,49,270,294`

## State machine (tool execution)

`validating → found → executing → completed | failed`. Missing handler is the `not_found` terminal (throw). See `flowcharts/agents.md` §3. 🟢

## Fluxos Alternativos

- **Cancellation / timeout:** mapped to `CANCELLATION` / `TIMEOUT` categories. 🟢 `error-formatter.ts:12`

## Dependências

- `error-formatter` (formatError). 🟢
- `ToolExecutionContext` supplies workspace/vscode/chatContext/telemetry. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Registry pattern decoupling command names from behavior | `tool-registry.ts` | 🟢 |
| Centralized error categorization with 6 buckets + sanitization | `error-formatter.ts:12,270` | 🟢 |

## Estado Interno

`Map<string, ToolHandler>` keyed by tool name. 🟢

## Observabilidade

`durationMs` in metadata; error telemetry with severity by category. 🟢

## Riscos e Lacunas

- 🟡 Param validation depth (schema vs presence) not enumerated — confirm in `tool-registry.ts:67`.
