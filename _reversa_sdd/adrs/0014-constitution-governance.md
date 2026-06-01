# ADR-0014: Constitution-driven engineering governance

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
The project is itself developed with Spec-Driven Development and heavy AI-agent involvement. Consistent, machine-checkable engineering rules are needed so that both humans and agents produce uniform code.

## Decision
Adopt a **project constitution** (`.specify/memory/constitution.md`, mirrored into `AGENTS.md`/`CLAUDE.md`) with five **non-negotiable** principles:
1. **Kebab-case file naming** (linter-enforced; config-file exceptions).
2. **TypeScript-first** (`strict: true`, no unjustified `any`, full public types).
3. **Test-First / TDD** (red-green-refactor; PRs without tests rejected; coverage must not drop).
4. **Observability** (telemetry/logging/error reporting on significant ops; no silent failures).
5. **Simplicity / YAGNI** (build only what's needed; refactor on Rule of Three).
Plus a mandate to run `npm run check` before completing any task.

## Evidence
- `.specify/memory/constitution.md` (673 lines); `AGENTS.md`; 247 test files; Biome via ultracite; per-feature telemetry modules.

## Consequences
- Uniform, agent-friendly codebase; quality gates are explicit.
- Some principles are aspirational vs reality: several **stubs** exist (`validateConstitution`, `validateVariables`) and known **duplication** (task providers, trigger-selectors) sits in tension with YAGNI/Rule-of-Three.
- TDD + coverage rules make the test suite a first-class, large artifact.
