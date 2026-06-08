# language: en
# spec-id: PT-005
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/cloud-agents.md (polling + PR reconciliation)
#   target_architecture: BC-04 cloud (AGG-CloudSession); coroutine polling (AD-04)
#   business_rules: R-CD-4, R-CD-10, R-CD-12
#   paradigma_alvo: internally event-driven (polling) -> coroutines + message bus
Feature: Cloud polling and PR-to-tasks reconciliation
  As a developer delegating to cloud agents
  I want polling stop conditions and idempotent PR reconciliation preserved
  So that the migrated plugin behaves identically under async

  @paridade @critico
  Scenario: Polling stops after three consecutive failures
    Given a cloud session being polled
    When polling fails three consecutive times
    Then polling stops
    And a credential-expiry callback fires

  @paridade @idempotencia
  Scenario: PR state change marks the tasks.md checkbox exactly once
    Given a cloud task "T040" with an open PR and an unchecked "- [ ] T040" in tasks.md
    When polling detects the PR transition open to merged
    And the same merged state is observed again on the next poll
    Then "- [x] T040" is written exactly once
    And re-observation does not duplicate the write

  @paridade @ordem
  Scenario: Client-side rate limiting preserves call spacing
    Given the client rate limit of at least 500 ms between calls and at most 60 per minute
    When polling issues a burst of requests
    Then calls are spaced to honor the limit using exponential backoff with jitter
