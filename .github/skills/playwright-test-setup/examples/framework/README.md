# Playwright Framework Reference (Markdown Only)

This framework folder contains reference snippets only.

## Important

- All TypeScript and `package.json` files are published as `.md` snippets.
- Convert snippets into real files in your own runnable test repository.

## Suggested Scaffold Mapping

Use these references when creating files in your target project:

- `playwright.config.ts.md` -> `playwright.config.ts`
- `package.json.md` -> `package.json`
- `config/projects.ts.md` -> `config/projects.ts`
- `config/environments/*.ts.md` -> `config/environments/*.ts`
- `objects/pages/*.ts.md` -> `objects/pages/*.ts`
- `objects/components/*.ts.md` -> `objects/components/*.ts`
- `testFixtures/base.ts.md` -> `testFixtures/base.ts`
- `tests/*.spec.ts.md` -> `tests/*.spec.ts`
- `types/*.ts.md` -> `types/*.ts`
- `utils/environmentManager.ts.md` -> `utils/environmentManager.ts`

## Bring-Up Checklist

1. Create file structure in your target project.
2. Paste content from each `.md` reference into corresponding runnable files.
3. Install dependencies and browsers.
4. Run one smoke test first.
5. Expand to the full suite after the first passing run.

## Commands (Target Project)

```bash
npm install
npx playwright install
npx playwright test
```

## Quality Baselines

- Prefer `getByTestId` selectors.
- Keep tests independent.
- Use dynamic waiting over fixed timeouts.
