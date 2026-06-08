---
schemaVersion: 1
generatedAt: 2026-06-07T20:32:17Z
reversa:
  version: "1.2.34"
kind: data_migration_plan
producedBy: designer
hash: "sha256:e1a6bdc98826b72cfecfb20ab85da901606daaa46f7acf344a3b684f0bb1154b"
---

# Data Migration Plan

> **There is no runtime data migration.** The legacy has no database (ADR-0005), and v1 performs **no config/state import** from VS Code (decision AMB-006). This document records *why* there is no ETL, the design-time state-shape mapping that replaces it, and the one genuinely-shared data surface (repo spec files).

## Resumo
- **Estimated volume**: 0 rows / 0 GB to migrate (no datastore; local per-project state only).
- **Window**: n/a — see `cutover_plan.md` (Marketplace release model; no data cutover).
- **Strategy**: **none / not applicable**. New users start with empty local state on the JetBrains side; existing repo spec artifacts are read in place.

## Why no ETL
1. **No source datastore**: legacy state lives in `workspaceState`, JSON/JSONL files, `SecretStorage`, and repo markdown (`erd-complete.md` legend) — there is no DB to extract from.
2. **No import in v1 (AMB-006)**: the objective is **expand reach** to *new* JetBrains users; cross-IDE state continuity is explicitly deferred. So even the file-based state is not imported.
3. **Greenfield local state**: the JetBrains plugin creates its own `PersistentStateComponent`/`PasswordSafe`/project-file state fresh (`target_data_model.md`).

## Mapeamento legado -> novo (design-time state-shape mapping, not a data move)

| Legacy state source | New target store | Type | Notes |
|---|---|---|---|
| `workspaceState` `gatomia.hooks.configurations` | `PersistentStateComponent` (hooks XML) | shape map | not imported in v1; schema validation only |
| `.vscode/gatomia/` session JSON + JSONL | plugin project dir (JSON + JSONL) | shape map | created fresh per user |
| Devin session JSON (7-day) + `SecretStorage` | `PersistentStateComponent` + `PasswordSafe` | shape map | secrets re-entered by the user |
| review-flow `workspaceState` JSON | `PersistentStateComponent` (spec XML) | shape map | created fresh |
| **repo** SpecKit/OpenSpec specs, `.agent.md`, steering | **same repo files** | **shared, in place** | IDE-agnostic paths; read natively by both IDEs — **no migration** |

## Transformações
- **None at runtime.** The only "transformations" are the design-time shape maps above (e.g., legacy `trigger` -> normalized `events[]` is already the legacy's persisted shape, R-HK-8; the new store simply adopts the normalized shape).
- **Invalid-data handling**: n/a (no data ingested).

## Estratégia de ETL
- **Tool**: none.
- **Flow**: n/a.
- **Idempotency**: n/a.
- **Throughput**: n/a.

## Backfill e delta
- **Backfill**: n/a (no source rows).
- **Delta capture**: n/a.
- **Reconciliation**: n/a.

## Cutover de dados
- **Window**: n/a (no data cutover; see `cutover_plan.md` for the Marketplace release model).
- **Cut sequence**: n/a.
- **Post-cut verification**: n/a for data; behavioral parity is verified by the Inspector's `parity_specs.md` (Strategy C), not by row counts.

## Validação de qualidade
| Metric | Target | Source |
|---|---|---|
| Rows migrated | 0 (by design) | n/a |
| Repo spec files readable by new plugin | 100% | open the same `specs/`/`openspec/`/`.specify/` dirs and confirm parse |
| Behavioral parity (not data parity) | per `parity_specs.md` | Inspector golden cases vs VS Code oracle |

## Riscos específicos de dados
- **RISK-008** (dual maintenance / divergence) — see `risk_register.md`. There is **no** data-loss/ETL risk because nothing is migrated.
- Minor: the plugin-owned persistence directory path is an implementation choice (`target_data_model.md` Notes), not a migration risk.

## Notas
- If a future release adds VS Code -> JetBrains import (revisiting AMB-006), it would be a **one-way file importer** for `hooks.json` + session JSON, not a DB ETL — to be specified in a forward cycle.
- The shared repo spec files are the reason functional parity for the Spec Lifecycle context is largely about **behavior over the same files**, not data movement.
