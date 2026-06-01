# spec-system-adapter (use-case)

> Use-case under `utils`. The unified SpecKit/OpenSpec facade — the highest-blast-radius component.
> Source: `spec-kit-adapter.ts`, `spec-kit-utilities.ts`, `flowcharts/utils.md` §1.

## Visão Geral

`SpecSystemAdapter` resolves the active SDD system (preference → auto-detect → QuickPick if both), sets the spec/prompt paths accordingly, and provides unified list/create/getFiles/open operations across SpecKit (`specs/NNN-slug/` + `.specify/`) and OpenSpec (`openspec/`). 🟢

## Responsabilidades

- `initialize`: require a workspace; resolve the active system + paths. 🟢
- Enumerate feature files (known-file map + `extra:` discovery). 🟢
- Parse/validate SpecKit feature dirs + compute the next number. 🟢

## Regras de Negócio

- **R-SP-9** explicit pref wins; else auto-detect; both + no pref → QuickPick + persist (cancel ⇒ default SpecKit, not persisted). 🟢 `spec-kit-adapter.ts:93-144`
- **R-SP-10** SpecKit dir `^\d{3,}-(.+)$`; next = max+1; unknown files → `extra:`/`extra-folder:`. 🟢 `spec-kit-utilities.ts:80-167`; `spec-kit-adapter.ts:364-394`
- SpecKit → `specsPath=specs/`, `promptsPath=.specify/templates`; OpenSpec → `specsPath=openspec`, `promptsPath=prompts`. 🟢 `flowcharts/utils.md` §1

## Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Workspace gate | Must | no workspace → throw |
| RF-02 | System resolution | Must | pref → use; both → QuickPick + persist; one → use; none → AUTO (R-SP-9) |
| RF-03 | Path config | Must | paths set per system |
| RF-04 | Feature files | Must | known-file map + `extra:` entries (R-SP-10) |
| RF-05 | Numbering | Must | dir regex match; next = max+1 (R-SP-10) |

## Requisitos Não Funcionais

| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Estabilidade | Singleton facade isolates the rest of the app from system differences | `spec-kit-adapter.ts:83` | 🟢 (high blast radius) |

## Critérios de Aceitação

```gherkin
Dado ambos os sistemas presentes sem preferência
Quando initialize roda
Então uma QuickPick é exibida e a escolha persistida; cancelar ⇒ SpecKit não persistido (R-SP-9)

Dado um diretório "012-x" em specs/
Quando os features são descobertos
Então é reconhecido e o próximo número é max+1 (R-SP-10)
```

## Prioridade (MoSCoW)

| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| All (RF-01–RF-05) | Must | Every spec-aware module depends on it |

## Rastreabilidade de Código

| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `spec-kit-adapter.ts` | `initialize` (83,93-144), `getSpecKitFeatureFiles` (317,364-394) | 🟢 |
| `spec-kit-utilities.ts` | `parseSpecKitDirectoryName` (80), `discoverSpecKitFeatures` (124) | 🟢 |
