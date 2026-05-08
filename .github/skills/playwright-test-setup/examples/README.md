# Playwright Examples (Reference Only)

This directory contains markdown-based Playwright examples intended for copy-and-adapt workflows.

## Important

- `.ts` and `package.json` are stored as `.md` files on purpose.
- These files are non-runnable inside this skill folder.
- Copy snippets into your own Playwright project before running tests.

## Structure

```
examples/
|-- framework/
|   |-- config/**/*.ts.md
|   |-- objects/**/*.ts.md
|   |-- testFixtures/base.ts.md
|   |-- tests/*.spec.ts.md
|   |-- types/*.ts.md
|   |-- utils/*.ts.md
|   |-- playwright.config.ts.md
|   |-- package.json.md
|   `-- README.md
|-- basic-example.spec.ts.md
|-- console-logging-example.spec.ts.md
|-- static-html-example.spec.ts.md
`-- sample.html
```

## How to Use

1. Choose an example markdown source.
2. Copy the fenced code into a runnable file in your target project.
3. Install dependencies in that target project.
4. Run Playwright from the target project root.

## Standalone References

- `basic-example.spec.ts.md`
- `console-logging-example.spec.ts.md`
- `static-html-example.spec.ts.md`

## Framework References

See `framework/README.md` for the full scaffold mapping.

## Commands (Run In Your Target Project)

```bash
npm init -y
npm install -D @playwright/test typescript
npx playwright install
npx playwright test
```

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Guide](https://playwright.dev/docs/test-typescript)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)

## Next Steps

1. Try standalone examples first
2. Explore the framework structure
3. Create your own page objects
4. Add custom fixtures
5. Integrate with CI/CD

For detailed framework documentation, see [framework/README.md](framework/README.md).
