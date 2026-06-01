# create-instruction-rule, Design Técnico

> HOW instruction rules are created. Source: `instruction-rules.ts` (110), `steering-manager.ts:235-323`, `flowcharts/steering.md` §5.

## Interface

| Símbolo | Assinatura | Retorno | Observação |
|---------|-----------|---------|------------|
| `normalizeInstructionRuleName` | `(name)` | `{ok:true, normalizedName} \| {ok:false, error}` | `:38` |
| `buildInstructionRuleTemplate` | `(name, ...)` | `string` | `:74` |
| `SteeringManager.createProjectInstructionRule` / `createUserInstructionRule` | `()` | `Promise<boolean>` | `:235/297` |

## Fluxo Principal (§5)

1. Input name. 🟢
2. `normalizeInstructionRuleName` → kebab-case (trim/lowercase, collapse non-alphanumerics to `-`, trim dashes, validate). 🟢
3. Invalid → error, abort. 🟢
4. Resolve dir: project `.github/instructions/` or user `~/.github/instructions/`. 🟢
5. `assertFileDoesNotExist` → if exists → error, abort. 🟢
6. Write `<name>.instructions.md` template (frontmatter `description` + `applyTo:'**'`) + open. 🟢

## File format

```
---
description: ...
applyTo: '**'
---
<body>
```
File: `<kebab-name>.instructions.md`. 🟢 `instruction-rules.ts:70-76`

## Fluxos Alternativos

- **Empty/invalid name:** rejected before any FS access. 🟢

## Dependências

- `vscode.workspace.fs`, `node:os` (homedir), `node:path`. 🟢

## Decisões de Design Identificadas

| Decisão | Evidência | Confiança |
|---------|-----------|-----------|
| Kebab-case enforced (consistent rule filenames) | `instruction-rules.ts:38` | 🟢 |
| Non-destructive (assert-not-exists before write) | `:98-109` | 🟢 |

## Estado Interno

None (pure file operation). 🟢

## Observabilidade

Success/failure surfaced to the user. 🟡

## Riscos e Lacunas

None notable. 🟢
