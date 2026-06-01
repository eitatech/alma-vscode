# create-instruction-rule (use-case)

> Use-case under `steering`. Create a project/user `*.instructions.md` rule.
> Source: `steering-manager.ts`, `instruction-rules.ts`, `flowcharts/steering.md` §5.

## Visão Geral

Prompts for a rule name, normalizes it to kebab-case (rejecting invalid names), resolves the project (`.github/instructions/`) or user (`~/.github/instructions/`) directory, refuses to overwrite an existing file, and writes a `<name>.instructions.md` template with `applyTo:'**'` frontmatter. 🟢

## Responsabilidades

- Accept a name and normalize to kebab-case; reject invalid. 🟢
- Resolve the target dir (project vs user). 🟢
- Assert the file does not already exist (refuse overwrite). 🟢
- Write the template and open it. 🟢

## Regras de Negócio

- **R-SP-11** Name must normalize to lowercase kebab-case (else rejected); file `<name>.instructions.md` with frontmatter `description` + `applyTo:'**'`; refuses to overwrite. 🟢 `instruction-rules.ts:38-76,98-109`
- Project rules → `.github/instructions/`; user rules → `~/.github/instructions/`. 🟢 `steering-manager.ts:259-273,316-323`

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Name normalization | Must | `normalizeInstructionRuleName` → kebab; invalid → error (R-SP-11) |
| RF-02 | Dir resolution | Must | project → `.github/instructions/`; user → `~/.github/instructions/` |
| RF-03 | No overwrite | Must | existing file → error, no write |
| RF-04 | Write + open | Must | `<name>.instructions.md` template written and opened |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Refuses to overwrite existing rule files | `instruction-rules.ts:98-109` | 🟢 |

## Critérios de Aceitação

```gherkin
Dado o nome "My Rule!"
Quando createProjectInstructionRule roda
Então o nome é normalizado para "my-rule" e .github/instructions/my-rule.instructions.md é criado (R-SP-11)

Dado um arquivo de regra já existente
Quando a criação roda com o mesmo nome
Então um erro "file exists" é retornado e nada é sobrescrito

Dado um nome que não normaliza para kebab válido
Quando a criação roda
Então um erro de nome inválido é retornado
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-04) | Must | Instruction-rule authoring |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `instruction-rules.ts` | `normalizeInstructionRuleName` (38), `buildInstructionRuleTemplate` (74), `assertFileDoesNotExist` (98) | 🟢 |
| `steering-manager.ts` | `createProjectInstructionRule` (235), `createUserInstructionRule` (297) | 🟢 |
