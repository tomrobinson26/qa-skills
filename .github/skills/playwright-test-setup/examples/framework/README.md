# Playwright TypeScript Testing Framework

## Overview

This is a comprehensive Playwright-based end-to-end testing framework using TypeScript and the Page Object Model (POM) design pattern.

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Install Playwright browsers**:
   ```bash
   npx playwright install
   ```

3. **Configure environment** (copy and modify):
   ```bash
   cp .vscode/settings.json.example .vscode/settings.json
   ```

4. **Run tests**:
   ```bash
   npm test
   ```

## Project Structure

```
├── config/
│   ├── environments/          # Environment configs (qa, staging, prod)
│   └── projects.ts            # Browser configurations
├── objects/
│   ├── components/            # Reusable UI components
│   └── pages/                 # Page Object Models
├── testFixtures/
│   └── base.ts                # Custom fixtures
├── tests/
│   └── *.spec.ts              # Test files
├── types/
│   ├── envConfig.ts           # Environment type definitions
│   └── pages.ts               # Page type definitions
├── utils/
│   └── environmentManager.ts  # Environment management
└── playwright.config.ts       # Playwright configuration
```

## Running Tests

```bash
# All tests
npm test

# Headed mode (see browser)
npm run test:headed

# UI mode (interactive)
npm run test:ui

# Debug mode
npm run test:debug

# Specific environment
npm run test:qa
npm run test:staging

# Tagged tests
npm run test:smoke
npm run test:qualitygate
```

## Writing Tests

### Basic Test

```typescript
import { test, expect } from '../testFixtures/base';

test('homepage loads', async ({ basePage }) => {
  await basePage.goto('/');
  await expect(basePage.h1).toBeVisible();
});
```

### Using Quality Gate

```typescript
import { test, qualityGate } from '../testFixtures/base';

test('quality checks pass @qualitygate', async ({ basePage }) => {
  await qualityGate(basePage, '/');
});
```

## Page Object Model

### Creating a New Page

1. Create page class in `objects/pages/`:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from './basePage';

export class LoginPage extends BasePage {
  url = '/login';
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('submit-button');
  }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

2. Add to `types/pages.ts`:

```typescript
export type Pages = {
  basePage: BasePage;
  loginPage: LoginPage;  // Add this
};
```

3. Register in `testFixtures/base.ts`:

```typescript
export const test = base.extend<Pages>({
  basePage: createPageFixture(BasePage),
  loginPage: createPageFixture(LoginPage),  // Add this
});
```

## Locator Strategy

**Prefer `data-testid`** for stable selectors:

```typescript
// ✅ Good
page.getByTestId('submit-button')

// ❌ Avoid
page.locator('div.form > button.btn-primary')
```

**Fallback order**:
1. `getByRole()` - semantic elements
2. `getByLabel()` - form inputs
3. Simple CSS - stable classes
4. `getByText()` - unique text

## Environment Management

Configure environments in `config/environments/`:

```typescript
// config/environments/qa.ts
export const qaConfig: EnvConfig = {
  baseUrl: 'https://qa.example.com',
  apiUrl: 'https://api-qa.example.com',
};
```

Access in tests:

```typescript
import { EnvironmentManager } from '../utils/environmentManager';

const envManager = new EnvironmentManager();
const baseUrl = envManager.getValue('baseUrl');
```

Set environment:
- VS Code: `.vscode/settings.json` → `"ENV": "qa"`
- CLI: `ENV=staging npx playwright test`

## Test Tags

- `@smoke` - Quick smoke tests
- `@regression` - Full regression
- `@qualitygate` - Quality checks
- `@visual` - Visual regression

Use in tests:
```typescript
test('login works @smoke', async ({ loginPage }) => {
  // ...
});
```

Run tagged tests:
```bash
npx playwright test --grep @smoke
```

## Best Practices

✅ **DO**:
- Import from `testFixtures/base.ts`, not `@playwright/test`
- Use `data-testid` for selectors
- Wait for `networkidle` before inspecting
- Keep tests independent
- Use Page Object Model
- Add descriptive test names

❌ **DON'T**:
- Use brittle CSS selectors
- Inspect DOM before load
- Create dependent tests
- Use fixed waits
- Duplicate setup code

## Troubleshooting

### Browser not installed
```bash
npx playwright install
```

### Flaky tests
- Add proper waits: `page.waitForLoadState('networkidle')`
- Use dynamic waiting, not fixed timeouts

### Element not found
- Check if element exists in browser DevTools
- Use Playwright Inspector: `npx playwright test --debug`

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
