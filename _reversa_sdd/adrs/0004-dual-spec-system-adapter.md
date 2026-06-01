# ADR-0004: Support both SpecKit and OpenSpec via an adapter + submission strategy

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Two Spec-Driven Development conventions exist in the wild: **SpecKit** (numbered `specs/NNN-slug/` + `.specify/`) and **OpenSpec** (`openspec/`). They differ in directory layout, file names, and submission prompts. The product wants to serve users of either without branching the whole codebase.

## Decision
Introduce a **unified facade** (`SpecSystemAdapter`, `UnifiedSpec`) over both systems plus a **submission strategy** (`SpecSubmissionStrategyFactory`) that picks OpenSpec vs SpecKit behavior. The active system is resolved by: explicit `gatomia.specSystem` config → auto-detection → user QuickPick when both are present (persisted; cancel defaults to SpecKit). Tasks use the same split via path-based `TaskProvider.canHandle`.

## Evidence
- `utils/spec-kit-adapter.ts` (`UnifiedSpec`, `KNOWN_SPEC_FILES`), `spec/spec-submission-strategy.ts`, `spec-manager.ts:130`.
- Rules R-SP-9, R-SP-10, R-SP-13 (`domain.md`).
- `tasks/{speckit,openspec}-task-provider.ts` near-duplicate providers.

## Consequences
- One codebase serves both ecosystems; switching is config-driven.
- The two task providers are **near-duplicates** (Rule-of-Three candidate flagged in `code-analysis.md`).
- Files outside the known-file set are surfaced as `extra:`/`extra-folder:` entries to avoid losing extension-generated docs.
