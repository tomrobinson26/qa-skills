# Getting Started with Playwright TypeScript Testing

## Overview

A comprehensive Playwright-based end-to-end testing framework using TypeScript and the Page Object Model (POM) design pattern for maintainable and scalable test automation.

## Quick Start (5 minutes)

### 1. Initialize a new project

```bash
# Create project directory
mkdir my-tests
cd my-tests

# Initialize npm project
npm init -y

# Install Playwright
npm install -D @playwright/test typescript
npx playwright install
```

### 2. Create your first test

Create `example.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('my first test', async ({ page }) => {
  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});
```

### 3. Run the test

```bash
npx playwright test
```

## Choose Your Approach

### Option A: Standalone Tests (Quickest)

Perfect for:
- Quick automation scripts
- One-off tests
- Learning Playwright
- Simple projects

**Setup:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Example from skill:**
```bash
# Copy standalone example
cp examples/basic-example.spec.ts ./

# Run it
npx playwright test basic-example.spec.ts --headed
```

### Option B: Full Framework (Recommended for Projects)

Perfect for:
- Large test suites
- Multiple environments
- Team collaboration
- Maintainable tests

**Setup:**
```bash
# Copy the entire framework
cp -r examples/framework/* ./

# Install dependencies
npm install

# Run tests
npm test
```

## Framework Structure

```
your-project/
├── config/
│   ├── environments/
│   │   ├── qa.ts           # QA environment config
│   │   ├── staging.ts      # Staging environment config
│   │   └── prod.ts         # Production environment config
│   └── projects.ts         # Browser configurations
├── objects/
│   ├── components/         # Reusable UI components
│   │   ├── cardComponent.ts
│   │   └── navigationComponent.ts
│   └── pages/              # Page Object Models
│       ├── basePage.ts     # Base page with common functionality
│       └── loginPage.ts    # Example login page
├── testFixtures/
│   └── base.ts             # Custom fixtures and quality gates
├── tests/
│   ├── basic-test.spec.ts
│   ├── element-discovery.spec.ts
│   └── quality-gate.spec.ts
├── types/
│   ├── envConfig.ts        # Environment config types
│   └── pages.ts            # Page types
├── utils/
│   └── environmentManager.ts
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Key Concepts

### 1. Page Object Model

Organize tests using page objects:

```typescript
// objects/pages/loginPage.ts
export class LoginPage extends BasePage {
  url = '/login';
  
  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username-input');
    this.submitButton = page.getByTestId('submit-button');
  }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.submitButton.click();
  }
}

// Use in tests
test('login works', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password');
});
```

### 2. Fixtures

Reusable test setup:

```typescript
import { test, expect } from '../testFixtures/base';

test('test with fixture', async ({ basePage }) => {
  // basePage is automatically set up
  await basePage.goto('/');
  await expect(basePage.h1).toBeVisible();
});
```

### 3. Quality Gates

Automated quality checks:

```typescript
import { test, qualityGate } from '../testFixtures/base';

test('quality checks @qualitygate', async ({ basePage }) => {
  await qualityGate(basePage, '/');
  // Checks: SEO, images, header/footer, H1, etc.
});
```

### 4. Environment Management

```typescript
// Set environment
// .vscode/settings.json
{
  "playwright.env": { "ENV": "qa" }
}

// Or via CLI
ENV=staging npx playwright test

// Access in code
const envManager = new EnvironmentManager();
const baseUrl = envManager.getValue('baseUrl');
```

## Common Commands

```bash
# Run all tests
npx playwright test

# Run specific test
npx playwright test tests/login.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Debug mode
npx playwright test --debug

# Run tagged tests
npx playwright test --grep @smoke
npx playwright test --grep @qualitygate

# Generate code (record actions)
npx playwright codegen http://localhost:3000
```

## Locator Strategy (Best Practice)

Following the boilerplate style guide:

```typescript
// ✅ BEST: data-testid (stable, semantic)
page.getByTestId('submit-button')
page.getByTestId('username-input')

// ✅ GOOD: Role-based (semantic)
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { level: 1 })

// ✅ OK: Label-based (forms)
page.getByLabel('Username')
page.getByLabel('Email Address')

// ⚠️ USE SPARINGLY: Text-based (can change)
page.getByText('Click here')

// ❌ AVOID: Brittle CSS selectors
page.locator('div.form > button.btn-primary')
```

## Example Workflows

### Discovery Workflow

```typescript
test('discover page elements', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle'); // CRITICAL
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  
  // Find all links
  const links = await page.locator('a').all();
  console.log(`Found ${links.length} links`);
  
  // Take screenshot
  await page.screenshot({ path: 'page.png', fullPage: true });
});
```

### Form Testing

```typescript
test('submit form', async ({ page }) => {
  await page.goto('/contact');
  
  await page.getByTestId('name-input').fill('John Doe');
  await page.getByTestId('email-input').fill('john@example.com');
  await page.getByTestId('message-input').fill('Test message');
  await page.getByTestId('submit-button').click();
  
  await expect(page.getByText('Thank you')).toBeVisible();
});
```

### Console Logging

```typescript
test('capture console', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('http://localhost:3000');
  
  console.log('Console logs:', logs);
  
  // Assert no errors
  const errors = logs.filter(l => l.includes('error'));
  expect(errors).toHaveLength(0);
});
```

## Testing Static HTML

```typescript
import * as path from 'path';

test('test local HTML', async ({ page }) => {
  const htmlPath = path.resolve(__dirname, 'sample.html');
  await page.goto(`file://${htmlPath}`);
  
  await page.click('button');
  await page.fill('#name', 'Test User');
  await page.screenshot({ path: 'result.png' });
});
```

## Server Management

Configure your development server in `playwright.config.ts`:

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Playwright will automatically:
- Start the server before running tests
- Wait for it to be ready
- Shut it down after tests complete

## Best Practices

✅ **DO:**
- Use `data-testid` for stable selectors
- Wait for `networkidle` before inspecting
- Keep tests independent
- Use Page Object Model for maintainability
- Add test tags (`@smoke`, `@regression`)
- Import from `testFixtures/base.ts` (framework)

❌ **DON'T:**
- Use brittle CSS selectors
- Inspect DOM before page loads
- Create dependent tests
- Use fixed waits (`sleep(5000)`)
- Duplicate test setup code

## Troubleshooting

### Browser not installed
```bash
npx playwright install
```

### Tests won't run
```bash
# Check Playwright is installed
npx playwright --version

# Reinstall if needed
npm install -D @playwright/test
npx playwright install
```

### Element not found
- Check element exists in browser DevTools
- Wait for page load: `await page.waitForLoadState('networkidle')`
- Use Inspector: `npx playwright test --debug`

### Flaky tests
- Use dynamic waits, not fixed timeouts
- Check for race conditions
- Use `waitForSelector` with proper states

## Next Steps

1. ✅ Try standalone examples from `examples/`
2. ✅ Copy framework structure for your project
3. ✅ Create your first page object
4. ✅ Write your first test
5. ✅ Add quality gate tests
6. ✅ Integrate with CI/CD

## Resources

- **Skill Documentation**: `SKILL.md` - Complete skill reference
- **Examples**: `examples/` - Standalone and framework examples
- **Framework README**: `examples/framework/README.md` - Detailed framework docs
- [Playwright Docs](https://playwright.dev/)
- [TypeScript Guide](https://playwright.dev/docs/test-typescript)

## Support

For questions or issues:
1. Check `SKILL.md` for comprehensive documentation
2. Review examples in `examples/` directory
3. Consult [Playwright documentation](https://playwright.dev/)
