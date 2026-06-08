---
schemaVersion: 1
generatedAt: 2026-06-07T20:26:10Z
reversa:
  version: "1.2.34"
kind: cutover_plan
producedBy: strategist
hash: "sha256:29af8e338ecd1172ca36cd4b1eb597f99ca73c4f4ae8842248abcd305cc3050c"
---

# Cutover Plan

> Aligned to the recommended strategy in `migration_strategy.md` (A: incremental per-context build + C: parallel-run parity overlay).
> **Important reframing**: there is no production server, no shared runtime, and no runtime data to migrate. The legacy VS Code extension is **not decommissioned** (it serves a different audience). "Cutover" = **JetBrains Marketplace release** per slice; "rollback" = **yank the Marketplace version; users stay on the VS Code extension**.

## Base strategy
- **Confirmed strategy**: Incremental per-bounded-context build (Strategy A) with the Parallel-Run parity overlay (Strategy C). *Pending user confirmation at the post-Strategist gate — if the user picks Big Bang, replace the per-slice releases below with a single v1.0 release using the same go/no-go criteria.*

## Prerequisites
- [ ] Phase 0 foundation done (plugin skeleton, persistence, settings, telemetry, Git) and the **UI feasibility spike** (graph canvas + Kanban) has cleared RISK-001.
- [ ] The slice under release meets **behavioral parity** against the VS Code oracle for its scope (Inspector `parity_specs.md` green).
- [ ] JetBrains Marketplace account + plugin signing set up; EAP/beta channel configured.
- [ ] No critical defects open for the slice; AI Assistant integration validated (for the Conversational Agents slice, RISK-003).

## "Cutover" model (per-slice release, not a downtime window)
- **Target**: a Marketplace release event per bounded-context slice (Phase 1..5), not a date-bound outage window.
- **Estimated duration**: each release ~hours (build, sign, publish, channel promotion); the overall program is long (no deadline).
- **Environment affected**: the JetBrains Marketplace listing only. The VS Code Marketplace listing is **untouched**.
- **Prior communication**: changelog per release; EAP/beta opt-in for early adopters before stable promotion.

## Release steps (per slice)

| # | Step | Owner | Duration | Reversible? |
|---|---|---|---|---|
| 1 | Build the slice; run unit + integration tests | maintainer | minutes | yes |
| 2 | Run Parallel-Run parity tests vs the VS Code oracle for the slice scope | maintainer | minutes-hours | yes |
| 3 | Internal dogfood in a real IntelliJ IDEA install | maintainer | hours-days | yes |
| 4 | Publish to the Marketplace **EAP/beta** channel | maintainer | minutes | yes (unpublish) |
| 5 | Soak on EAP; collect feedback/telemetry | maintainer | days | yes |
| 6 | Promote to **stable** channel | maintainer | minutes | yes (version yank) |

## Rollback plan
- **Trigger criteria**: a critical regression or parity failure found after publish.
- **Steps**:
  1. Yank/unpublish the affected JetBrains plugin version (or revert the stable channel to the prior version).
  2. Communicate via the changelog; affected users roll back to the previous plugin version.
  3. The VS Code extension remains fully available as the unaffected alternative for the same capability.
- **Max acceptable time to rollback**: minutes (Marketplace version revert).
- **Rollback owner**: maintainer.
- **Note**: because the legacy is never shut down, rollback risk is bounded — there is no data loss or outage, only a feature-availability delta on the JetBrains side.

## Go / no-go criteria
- **Go**:
  - Parity tests pass for the slice scope (`parity_specs.md`).
  - No critical/blocker defects in EAP soak.
  - Platform integrations the slice depends on are functional (AI Assistant for agents; MCP client for hooks; ACP eligibility for local agents).
- **No-go**:
  - Parity test failures in the slice scope.
  - The slice depends on an unresolved Alta-severity risk (e.g., RISK-001 spike failed, or RISK-003 AI Assistant API blocked) without its contingency applied.

## Post-release
- [ ] Extended monitoring/telemetry per slice for a soak period.
- [ ] Parity re-validation per `parity_specs.md` after each legacy change (drift guard, RISK-008).
- [ ] **No legacy decommission** — the VS Code extension continues for its audience. Revisit a "VS Code → maintenance-only" decision only after the JetBrains plugin reaches full parity, as a separate product decision.

## Notes
- v1.0 public milestone = the first stable Marketplace release; the recommended minimum v1.0 scope (if capacity forces a cut, RISK-006 contingency) is **Spec Lifecycle + Automation**, with Conversational Agents / Cloud Delegation / Orchestration following in later releases.
- This plan deliberately omits the classic ETL / DNS-routing / freeze-writes steps from the template — they do not apply to a client-side IDE plugin with no server and no shared datastore.
