# ADR-0008: Select the Devin API version from the credential token prefix

- **Status:** Accepted (retroactive)
- **Confidence:** 🟢

## Context
Devin exposes multiple API generations: unscoped v1/v2 and an org-scoped v3. The client must target the correct endpoints/auth for whatever credential the user supplies, without asking them which API version they have.

## Decision
**Detect the API version from the token prefix** and route to the matching client:
- `cog_` → **v3** (org-scoped; **requires** a non-empty `orgId`, else `DevinOrgIdRequiredError`).
- `apk_` / `apk_user_` → **v1/v2** (unscoped).
- unknown prefix → throw.

A `devin-api-client-factory` builds the right client; snake_case API shapes are mapped to camelCase per client.

## Evidence
- `api-version-detector.ts:31`, `config.ts:40,52`, `devin-api-client-{v1,v3}.ts`, factory `:44`.
- Rule R-CD-1; command-level enforcement `devin-commands.ts:239` (cog_ requires Org ID).

## Consequences
- Zero-config version selection for the user.
- Status resolution must reconcile raw `DevinApiStatus` + `statusDetail` (detail wins; base can be stale — R-CD-3).
- Cancellation is **local-only** — the Devin API has no cancel endpoint (R-CD-2), a notable behavioral limitation surfaced to users.
