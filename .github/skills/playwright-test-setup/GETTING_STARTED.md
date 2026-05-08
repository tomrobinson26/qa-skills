# Getting Started with Playwright Test Setup

## Overview

This skill stores TypeScript and package examples as markdown-only reference files.
The example files are intentionally non-runnable so the skill folder does not raise missing-install diagnostics in repos that do not have Playwright dependencies installed.

## Quick Start

1. Initialize your target test project.

```bash
npm init -y
npm install -D @playwright/test typescript
npx playwright install
```

2. Copy code from markdown examples into runnable files in that target project.

- Standalone spec references are in `examples/*.spec.ts.md`
- Framework references are in `examples/framework/**/*.ts.md`
- Package manifest reference is in `examples/framework/package.json.md`

3. Run tests in your target project.

```bash
npx playwright test
```

## Setup Modes

### Option A: Standalone

Use the standalone markdown references and create files in your target project.

- Source: `examples/basic-example.spec.ts.md`
- Source: `examples/console-logging-example.spec.ts.md`
- Source: `examples/static-html-example.spec.ts.md`

### Option B: Framework

Use framework markdown references to scaffold a maintainable suite.

- Framework guide: `examples/framework/README.md`
- Config and types: `examples/framework/config/`, `examples/framework/types/`
- Page objects and fixtures: `examples/framework/objects/`, `examples/framework/testFixtures/`

## Migration Note

If older docs mention copying runnable `.ts` files directly from this skill, replace that flow with:

1. Open the corresponding `.ts.md` reference.
2. Copy the snippet into a new runnable file in your own project.
3. Install dependencies in that project and execute tests there.

## Locator Guidance

- Prefer `getByTestId` for stable selectors.
- Use role or label-based locators when test IDs are unavailable.
- Avoid brittle styling or positional selectors.

## Troubleshooting

- Missing browser binaries: run `npx playwright install`
- Missing package dependencies: run `npm install`
- Wrong folder: ensure commands run where your target `package.json` exists

## Resources

- Skill summary: `SKILL.md`
- Examples overview: `examples/README.md`
- Playwright docs: https://playwright.dev/

For questions or issues:
1. Check `SKILL.md` for comprehensive documentation
2. Review examples in `examples/` directory
3. Consult [Playwright documentation](https://playwright.dev/)
