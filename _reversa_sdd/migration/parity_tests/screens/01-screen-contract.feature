# language: en
# spec-id: PT-S01
# traceability:
#   target_screens: _reversa_sdd/migration/target_screens.md (all 14 screens)
#   screen_mode: modernized (_reversa_sdd/migration/screen_modernization_decision.md)
#   deviations: DEV-001..DEV-006 (approved)
#   paradigma_alvo: React webview -> Compose/Jewel (modernized) — contract parity, NOT byte/pixel
Feature: Screen contract parity (modernized mode)
  As the migrated UI
  I want each screen to honor its component hierarchy, events, verbatim content, and 4 states
  So that behavioral parity holds without byte/pixel comparison
  # This file is the representative contract pattern; it applies to ALL 14 screens
  # in target_screens.md. The coding agent instantiates one contract per screen.

  @paridade-visual @contrato-tela
  Scenario Outline: Each screen exposes the four canonical states
    Given the "<screen>" composable from target_screens.md
    When the screen is rendered in state "<state>"
    Then the state-appropriate content is shown
    And no byte or pixel comparison is performed

    Examples:
      | screen          | state   |
      | Hooks Form      | idle    |
      | Hooks Form      | loading |
      | Hooks Form      | error   |
      | Hooks Form      | success |
      | Agent Chat      | idle    |
      | Agent Chat      | loading |
      | Agent Chat      | error   |
      | Agent Chat      | success |

  @paridade-visual @contrato-tela
  Scenario: Textual content is preserved verbatim from the legacy
    Given the "Welcome to GatomIA" screen
    When it is rendered
    Then the tab labels are exactly "Setup", "Features", "Configuration", "Status", "Learn"
    And the title is exactly "Welcome to GatomIA"

  @paridade-visual @contrato-tela
  Scenario: Declared events are wired
    Given the "Hooks Form" screen
    When the action type "MCP" is selected
    Then the MCP tool picker is shown (backed by the own MCP client)
    And saving with an out-of-scope variable is rejected (strict gating)

  @paridade-visual @contrato-tela
  Scenario: Component hierarchy honored for the heavy canvas (accepted deviation)
    Given the "Orchestration (MAESTRO)" screen rebuilt natively (DEV-004)
    When the Board tab is shown
    Then lanes "Running", "Blocked", "Ready" are present with their cards
    And parity is asserted on lane/card semantics, not on React Flow rendering
