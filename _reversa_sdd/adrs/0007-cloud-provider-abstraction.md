# ADR-0007: Provider-agnostic cloud-agent layer; legacy Devin kept in parallel

- **Status:** Accepted (retroactive) — with active tech debt
- **Confidence:** 🟡

## Context
The first cloud integration was a **standalone Devin** REST integration (spec `001-devin-integration`). Adding a second cloud backend (GitHub Copilot coding agent, spec `016-multi-provider-agents`) made the Devin-specific shape untenable.

## Decision
Introduce a **provider-agnostic `CloudAgentProvider` interface** (`createSession`, `pollSessions`, `cancelSession`, `getExternalUrl`, `handleBlockedSession`) with adapters for Devin (REST) and GitHub Copilot (GraphQL). A unified polling service, normalized `AgentSession`/`TaskStatus`/`PullRequest`, a provider registry (one active provider), and legacy-Devin auto-migration sit on top. The `devin-adapter` **delegates** to the existing `devin/*` modules ("without breaking changes").

## Evidence
- `cloud-agents/cloud-agent-provider.ts`, `adapters/{devin,github-copilot}-adapter.ts`, `migration-service.ts`.
- Commit *"rename Devin Progress view to Cloud Agents and add multi-provider infrastructure"*.

## Consequences
- Adding a third provider is now an adapter, not a rewrite.
- 🔴 **The legacy standalone `devin` integration is still wired in `extension.ts` in parallel** with the unified path. The ownership boundary for a given session's polling is undetermined (`domain.md` §5.1) — a real source of duplicated session lifecycles and potential double-polling.
- Two `PullRequest`/status shapes coexist (devin vs cloud) requiring mapping.
