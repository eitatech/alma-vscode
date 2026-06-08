# language: en
# spec-id: PT-007
# traceability:
#   flowcharts: _reversa_sdd/flowcharts/hooks.md (completion detection)
#   target_architecture: BC-02 automation; BulkFileListener (AD-04)
#   business_rules: R-HK-7
#   paradigma_alvo: FS watchers -> IntelliJ BulkFileListener (async behavioral parity)
Feature: Hook completion detection via filesystem watching
  As the automation engine
  I want completion detected by validated filesystem changes, not mere command dispatch
  So that the migrated plugin fires after hooks at the right moment

  @paridade
  Scenario: Completion is detected on a validated file change with debounce
    Given a watcher on "**/specs/*/spec.md"
    When the spec file is written and parses validly
    And a 2 second debounce window elapses
    Then the operation is considered complete
    And the after-timing hooks fire

  @paridade
  Scenario: Dispatch without a file change does not signal completion
    Given a command is dispatched but no watched file changes
    When the debounce window elapses
    Then completion is not signaled
    And no after-timing hook fires
