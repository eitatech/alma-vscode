# language: en
# spec-id: PT-001
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/spec.md (spec status FSM)
#   target_architecture: BC-01 spec (AGG-Spec)
#   business_rules: R-SP-2, R-SP-3, R-SP-5
#   paradigma_alvo: OO-with-DI (no host paradigm change) — behavioral parity
Feature: Spec send-to-review and archive gates
  As a developer using the SDD workbench
  I want spec status transitions to enforce the same gates as the legacy
  So that the migrated plugin preserves the review/archive lifecycle

  @paridade @critico
  Scenario: Send-to-review requires zero pending work
    Given a spec in status "current" with zero pending tasks and zero pending checklist items
    When the spec is sent to review
    Then the spec status becomes "review"
    And "completedAt" and "reviewEnteredAt" are stamped

  @paridade @critico
  Scenario: Send-to-review is blocked by pending tasks
    Given a spec in status "current" with one pending task
    When the spec is sent to review
    Then the transition is rejected
    And the spec remains in status "current"

  @paridade @critico
  Scenario: Archive requires review status and no blocking change requests
    Given a spec in status "review" with zero pending items and no blocking change requests
    When the spec is archived
    Then the spec status becomes "archived"
    And "archivedAt" is stamped

  @paridade
  Scenario: Unarchive returns to reopened
    Given a spec in status "archived"
    When the spec is unarchived
    Then the spec status becomes "reopened"
