---
description: "Use when the user asks to automate tests, convert manual/GWT/CSV tests to Playwright, set up a Playwright framework, debug failing Playwright tests, improve test reliability/quality/CI stability, or asks which Playwright skill to use. Routes between playwright-cli, playwright-test-gen, playwright-test-setup, and playwright-best-practices."
name: "Playwright Skill Routing"
---

# Playwright Skill Routing

Choose the Playwright skill by user intent, then guide the user through the smallest useful workflow.

## Primary Routing

- Use playwright-cli when the user needs interactive browser exploration, selector discovery, replaying flows, or debugging flaky/failing behavior.
- Use playwright-test-gen when the user wants to convert Given/When/Then or CSV manual tests into Playwright TypeScript tests with POM structure.
- Use playwright-test-setup when the user needs project/framework setup, folder conventions, fixtures, environment config, or general Playwright architecture guidance.
- Use playwright-best-practices when the user needs test stability improvements, flake reduction, CI reliability, accessibility quality checks, performance/security testing guidance, or advanced Playwright patterns.

## Sequencing Rules

- For manual-test automation, prefer this order:
  1. playwright-cli for selector and flow discovery.
  2. playwright-test-gen to generate tests.
  3. playwright-test-setup only for framework alignment gaps.
  4. playwright-best-practices to harden reliability and quality before scaling.
- If generated tests contain placeholder selectors, return to playwright-cli to confirm selectors, then patch generated files.
- Do not merge the responsibilities of these four skills in one response unless the user explicitly asks for an end-to-end combined run.

## Clarification Rules

- If intent is ambiguous, ask one focused question to disambiguate:
  - "Do you want to explore/debug interactively, generate tests from CSV/GWT, set up the Playwright framework, or improve reliability/quality with best practices?"
- If the user asks "which skill should I use", provide a direct recommendation first, then optionally provide a short sequence.

## Output Rules

- Keep routing recommendations concise and action-oriented.
- Prefer concrete next actions over theory.
- Keep human-readable references in docs; keep behavior guidance in instructions.
