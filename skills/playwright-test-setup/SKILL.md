---
name: playwright-test-setup
description: >
  Set up and scaffold a Playwright TypeScript test framework for web applications.
  Use when users ask to initialize Playwright, bootstrap a new E2E structure,
  add Page Object Model foundations, configure fixtures and environments, or fix
  setup issues such as missing installs and broken first-run commands.
license: Complete terms in LICENSE.txt
metadata:
  author: Tom Robinson - tom.robinson@msqdx.com
  version: "1.0.1"
---

# Playwright Test Setup

Creates a reliable starting point for Playwright plus TypeScript, with an optional full framework template.

## When to Use

- User asks to set up Playwright in a project
- User needs first-run commands for a new Playwright repo
- User wants a maintainable test architecture with page objects and fixtures
- User reports setup failures, missing browser installs, or missing package installs
- User wants to bootstrap from the included template examples

> How this fits together: use this skill for framework setup, use playwright-cli for live exploration, and use playwright-test-gen to convert manual Given/When/Then tests into Playwright specs.

See the workflow guide: [workflow-guide.md](../playwright-cli/references/workflow-guide.md)

## Procedure

1. Confirm project state.
Determine whether this is a new test project or an existing codebase adding Playwright.

2. Install core dependencies.
Ensure package initialization plus required Playwright and TypeScript dependencies are installed.

3. Install browsers.
Run Playwright browser installation after dependency install.

4. Choose setup mode.
Use quick mode for simple tests or framework mode for team-scale suites.

5. Scaffold files.
For framework mode, copy and adapt the structure from the framework example references.

6. Validate first test run.
Execute a minimal test command and confirm environment, browser, and command wiring all work.

7. Apply baseline quality rules.
Prefer stable locators, independent tests, and dynamic waits.

## Setup Modes

Note: example implementation files in this skill are markdown references (`*.md`) and are intended to be copied into a target runnable project.

### Quick Mode

Use when the user needs immediate coverage and minimal structure.

- Start with a single spec file and default Playwright config
- Keep setup minimal and iterate from passing tests

### Framework Mode

Use when the user needs a scalable suite.

- Use page objects, reusable fixtures, and environment config
- Start from template assets in the framework example directory

## Missing Install Recovery

When setup is flagged by missing installs:

1. Verify dependency install completed successfully.
2. Verify Playwright browsers are installed.
3. Verify commands run from the project root containing `package.json`.
4. Re-run a single smoke test before broader execution.

## Resources

- Getting started guide: [GETTING_STARTED.md](./GETTING_STARTED.md)
- Example overview: [README.md](./examples/README.md)
- Full framework template: [README.md](./examples/framework/README.md)
- Playwright documentation: https://playwright.dev/
- TypeScript documentation: https://www.typescriptlang.org/
- Playwright best practices: https://playwright.dev/docs/best-practices

## Notes for Skill Authors

- Keep this SKILL file concise for progressive loading.
- Place large code samples in referenced docs under examples or references.
- Prefer procedural instructions in this file and implementation details in linked resources.
- Ensure Playwright browsers are installed: `npx playwright install`
- Check if server is running on correct port
- Verify environment variables are set correctly

### Flaky Tests
- Add proper waits: `page.waitForLoadState('networkidle')`
- Use `waitForSelector` instead of fixed timeouts
- Check for race conditions with async operations

### Element Not Found
- Verify element exists in DOM using browser DevTools
- Check if element is hidden or not yet rendered
- Use Playwright Inspector: `npx playwright test --debug`

## Web Server Configuration

For tests that require a running development server, configure the web server in `playwright.config.ts`:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

This will automatically start your server before running tests and shut it down after.

## Examples

See `examples/` directory for:
- **framework/** - Complete framework structure template
- **basic-example.spec.ts** - Simple test example
- **console-logging-example.spec.ts** - Console log capture example
- **static-html-example.spec.ts** - Static HTML testing example
- **sample.html** - Sample HTML file for testing

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)