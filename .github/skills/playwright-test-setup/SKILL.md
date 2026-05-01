---
name: webapp-testing
description: Playwright TypeScript testing framework for web applications. Supports end-to-end testing with Page Object Model, fixtures, visual regression, accessibility testing, and comprehensive test automation.
license: Complete terms in LICENSE.txt
---
> **How this fits together:** This skill handles framework setup and patterns. See the [Playwright Skills Workflow Guide](../playwright-cli/references/workflow-guide.md) to understand how playwright-test-setup relates to playwright-cli (for exploration) and playwright-test-gen (for test generation).

---
# Web Application Testing with Playwright + TypeScript
## Quick Start


## Quick Start

1. **Initialize the testing framework** in your project directory:
   ```bash
   npm init -y
   npm install -D @playwright/test typescript
   npx playwright install
   ```

2. **Copy the framework structure** from `examples/framework/` to your project

3. **Run your first test**:
   ```bash
   npx playwright test
   ```

## Framework Structure

```
playwright/
├── config/
│   ├── environments/          # Environment-specific configuration (qa, staging, prod)
│   └── projects.ts            # Browser configuration
├── objects/
│   ├── components/            # Reusable UI components
│   └── pages/                 # Page Object Models
│       └── basePage.ts        # Base page class with common functionality
├── testFixtures/
│   └── base.ts                # Custom fixtures extending Playwright
├── tests/
│   └── *.spec.ts              # Your test files
├── types/
│   ├── envConfig.ts           # Environment configuration types
│   └── pages.ts               # Page type definitions
├── utils/
│   └── environmentManager.ts  # Environment variable management
├── playwright.config.ts       # Playwright configuration
└── package.json
```

## Key Concepts

### Page Object Model (POM)

Organize your tests using page objects for maintainability:

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

### Fixtures

Use custom fixtures for reusable test setup:

```typescript
import { test, expect } from '../testFixtures/base';

test('should login successfully', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    await expect(loginPage.page).toHaveURL('/dashboard');
});
```

### Locator Strategy

**Prefer `data-testid` attributes** for stable, maintainable selectors:

```typescript
// ✅ Preferred - stable and semantic
this.submitButton = page.getByTestId('submit-button');

// ❌ Avoid - brittle and coupled to structure
this.submitButton = page.locator('div.form > button.btn-primary');
```

**Fallback options** (in order of preference):
1. `getByRole()` - for semantic HTML elements
2. `getByLabel()` - for form inputs with labels
3. Simple CSS selectors - for stable class names
4. `getByText()` - for unique text content (use sparingly)

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/login.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Run tagged tests
npx playwright test --grep @smoke
npx playwright test --grep @qualitygate

# Run against specific environment
ENV=staging npx playwright test
```

## Common Test Patterns

### Basic Page Test

```typescript
import { test, expect } from '../testFixtures/base';

test('homepage loads correctly', async ({ basePage }) => {
    await basePage.goto();
    await expect(basePage.page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

### Form Interaction

```typescript
test('form submission works', async ({ page }) => {
    await page.goto('/contact');
    await page.getByTestId('name-input').fill('John Doe');
    await page.getByTestId('email-input').fill('john@example.com');
    await page.getByTestId('submit-button').click();
    await expect(page.getByText('Thank you')).toBeVisible();
});
```

### Element Discovery

```typescript
test('discover page elements', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    
    // Take screenshot
    await page.screenshot({ path: 'discovery.png', fullPage: true });
});
```

### Console Log Capture

```typescript
test('capture console logs', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('Console logs:', logs);
});
```

## Quality Gates & Testing

### Quality Gate Fixture

Run comprehensive quality checks:

```typescript
test('quality checks pass', async ({ qualityGate, basePage }) => {
    await qualityGate(basePage);
    // Automatically checks: SEO, images, headers, accessibility
});
```

### Accessibility Testing

```typescript
test('page is accessible', async ({ accessibility, basePage }) => {
    await accessibility(basePage);
    // Runs Axe accessibility tests against WCAG 2.0 Level A & AA
});
```

### Visual Regression

```typescript
test('visual regression check', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png');
});
```

## Environment Management

Configure different environments in `config/environments/`:

```typescript
// config/environments/qa.ts
import { EnvConfig } from '../../types/envConfig';

export const qaConfig: EnvConfig = {
    baseUrl: 'https://qa.example.com',
    apiUrl: 'https://api-qa.example.com',
};
```

Access environment config in tests:

```typescript
import { EnvironmentManager } from '../utils/environmentManager';

const envManager = new EnvironmentManager();
const baseUrl = envManager.getValue('baseUrl');
```

## Test Tags

Organize tests with tags for selective execution:

- `@smoke` - Quick smoke tests
- `@regression` - Full regression suite
- `@qualitygate` - Critical quality checks
- `@visual` - Visual regression tests

```typescript
test('login flow @smoke', async ({ loginPage }) => {
    // Test implementation
});
```

## Best Practices

### ✅ DO:
- Import fixtures from `testFixtures/base.ts`, not `@playwright/test`
- Use `data-testid` attributes for stable selectors
- Wait for `networkidle` before inspecting dynamic content
- Keep tests independent and self-contained
- Use Page Object Model for maintainability
- Add appropriate tags for test filtering
- Write descriptive test names

### ❌ DON'T:
- Use brittle CSS selectors based on styling classes
- Inspect DOM before page is fully loaded
- Create interdependent tests
- Use fixed waits (`wait(5000)`) - use dynamic waiting
- Duplicate test setup - use fixtures instead

## Troubleshooting

### Tests Fail Locally
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