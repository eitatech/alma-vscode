# Architecture Decision Records — gatomia (retroactive)

> Reconstructed by the Reversa Detective from code, `specs/`, Git history (880 commits), and `.specify/memory/constitution.md`.
> These ADRs are **retroactive**: the decisions were inferred after the fact, not written at decision time. Status `Accepted (retroactive)` means "the codebase demonstrably embodies this decision". Confidence tags: 🟢 strong code evidence · 🟡 inferred.

| ADR | Title | Status | Confidence |
|-----|-------|--------|------------|
| [0001](0001-fork-and-copilot-sdd-pivot.md) | Fork from kiro-for-codex-ide and pivot to GitHub Copilot + SDD | Accepted (retroactive) | 🟢 |
| [0002](0002-dual-build-esbuild-vite.md) | Dual-build: esbuild extension host + Vite React webview | Accepted (retroactive) | 🟢 |
| [0003](0003-postmessage-bridge-mirrored-contracts.md) | postMessage bridge as the sole host↔webview contract | Accepted (retroactive) | 🟢 |
| [0004](0004-dual-spec-system-adapter.md) | Support both SpecKit and OpenSpec via an adapter + strategy | Accepted (retroactive) | 🟢 |
| [0005](0005-no-database-persistence.md) | No database — workspaceState + JSON + SecretStorage | Accepted (retroactive) | 🟢 |
| [0006](0006-acp-for-local-agents.md) | Adopt the Agent Client Protocol for local CLI agents | Accepted (retroactive) | 🟢 |
| [0007](0007-cloud-provider-abstraction.md) | Provider-agnostic cloud layer; legacy Devin kept in parallel | Accepted (retroactive) | 🟡 |
| [0008](0008-devin-token-prefix-versioning.md) | Select Devin API version by credential token prefix | Accepted (retroactive) | 🟢 |
| [0009](0009-permission-and-pending-write-gates.md) | Tool-call permission model + pending file-write approval gate | Accepted (retroactive) | 🟢 |
| [0010](0010-spec-review-flow-fsm.md) | Spec review-flow FSM with change-request archival blockers | Accepted (retroactive) | 🟢 |
| [0011](0011-event-driven-hooks-engine.md) | Event-driven hooks automation engine with chain/cycle guards | Accepted (retroactive) | 🟢 |
| [0012](0012-worktree-isolation.md) | Git worktree isolation per agent session | Accepted (retroactive) | 🟢 |
| [0013](0013-global-resource-access-consent.md) | Global resource access consent gate (privacy) | Accepted (retroactive) | 🟢 |
| [0014](0014-constitution-governance.md) | Constitution-driven engineering governance | Accepted (retroactive) | 🟢 |
| [0015](0015-maestro-orchestration-prototype.md) | MAESTRO orchestration: pluggable tasks + autonomous loop | Proposed/Prototype | 🟡 |

## Timeline anchors (from Git)
- **2025-11-21** — Initial commit: clone from `kiro-for-codex-ide`; same-day pivot to Copilot + OpenSpec.
- **001→018** — SDD feature lineage (Devin → hooks → preview → welcome → review-flow → copilot-agents → custom hooks → steering → multi-provider → docs tree → agent-chat-panel).
- **2026-04-30 → 05-04** — `MAESTRO:` commit series builds the orchestration prototype, pluggable task layer, React Flow composer, Kanban board, and autonomous agent loop.
