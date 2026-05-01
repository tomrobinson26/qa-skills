# Playwright TypeScript Examples

This directory contains examples demonstrating Playwright with TypeScript for web application testing.

## Structure

```
examples/
├── framework/                 # Complete testing framework
│   ├── config/               # Environment and browser configs
│   ├── objects/              # Page objects and components
│   ├── testFixtures/         # Custom fixtures
│   ├── tests/                # Example tests
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── playwright.config.ts  # Playwright configuration
│   ├── package.json          # Dependencies
│   └── README.md             # Framework documentation
│
├── basic-example.spec.ts              # Simple element discovery
├── console-logging-example.spec.ts    # Console log capture
├── static-html-example.spec.ts        # Testing static HTML
└── sample.html                        # Sample HTML for testing
```

## Quick Start

### Option 1: Standalone Examples (No Framework)

Perfect for quick scripts and learning:

```bash
# Install Playwright
npm init -y
npm install -D @playwright/test
npx playwright install

# Run standalone example
npx playwright test basic-example.spec.ts --headed
```

**Standalone examples:**
- `basic-example.spec.ts` - Element discovery patterns
- `console-logging-example.spec.ts` - Capturing logs and errors
- `static-html-example.spec.ts` - Testing local HTML files

### Option 2: Full Framework (Recommended for Projects)

Complete testing framework with Page Object Model, fixtures, and environment management:

```bash
# Navigate to framework directory
cd framework

# Install dependencies
npm install

# Install browsers
npx playwright install

# Run tests
npm test
```

## Standalone Examples

### Basic Example

```typescript
import { test, expect } from '@playwright/test';

test('discover buttons', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
});
```

Run: `npx playwright test basic-example.spec.ts`

### Console Logging Example

Capture browser console logs and network failures:

```typescript
test('capture console logs', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', msg => logs.push(msg.text()));
  
  await page.goto('http://localhost:3000');
  console.log('Console logs:', logs);
});
```

Run: `npx playwright test console-logging-example.spec.ts`

### Static HTML Example

Test local HTML files without a server:

```typescript
test('test static HTML', async ({ page }) => {
  const fileUrl = 'file:///path/to/sample.html';
  await page.goto(fileUrl);
  await page.click('button');
});
```

Run: `npx playwright test static-html-example.spec.ts`

## Full Framework

The `framework/` directory contains a complete testing framework based on the boilerplate style guide.

### Features

- ✅ **Page Object Model** - Maintainable test structure
- ✅ **Custom Fixtures** - Reusable test setup
- ✅ **Environment Management** - QA, Staging, Production configs
- ✅ **Quality Gates** - Automated SEO, accessibility, and image checks
- ✅ **Test Tags** - `@smoke`, `@regression`, `@qualitygate`
- ✅ **Multi-browser** - Chrome, Firefox, Safari, mobile devices
- ✅ **TypeScript** - Type safety and IntelliSense

### Framework Tests

```bash
cd framework

# All tests
npm test

# Specific test file
npx playwright test tests/basic-test.spec.ts

# Headed mode
npm run test:headed

# UI mode (interactive)
npm run test:ui

# Tagged tests
npm run test:smoke
npm run test:qualitygate
```

### Creating Page Objects

```typescript
// objects/pages/loginPage.ts
import { Page } from '@playwright/test';
import { BasePage } from './basePage';

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
```

### Using Fixtures

```typescript
import { test, expect } from '../testFixtures/base';

test('homepage loads @smoke', async ({ basePage }) => {
  await basePage.goto('/');
  await expect(basePage.h1).toBeVisible();
});
```

## Locator Strategy

Following the boilerplate style guide, prefer `data-testid`:

```typescript
// ✅ Preferred - stable
page.getByTestId('submit-button')
page.getByTestId('username-input')

// ✅ Good - semantic
page.getByRole('button', { name: 'Submit' })
page.getByLabel('Username')

// ⚠️ Use sparingly - fragile
page.locator('div.form > button.primary')
page.getByText('Click here')
```

## Common Patterns

### Wait for Page Load

```typescript
await page.goto('http://localhost:3000');
await page.waitForLoadState('networkidle'); // CRITICAL for dynamic apps
```

### Take Screenshots

```typescript
await page.screenshot({ 
  path: 'screenshot.png', 
  fullPage: true 
});
```

### Capture Console Logs

```typescript
const logs: string[] = [];
page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
```

### Check for Broken Images

```typescript
const images = await page.locator('img').all();
for (const img of images) {
  const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
  if (naturalWidth === 0) {
    console.error('Broken image:', await img.getAttribute('src'));
  }
}
```

## Environment Variables

Set environment for framework tests:

```bash
# VS Code: .vscode/settings.json
{
  "playwright.env": {
    "ENV": "qa"
  }
}

# Command line
ENV=staging npx playwright test
```

## Test Organization

### Test Tags

```typescript
test('critical flow @smoke @qualitygate', async ({ page }) => {
  // ...
});
```

Run tagged tests:
```bash
npx playwright test --grep @smoke
npx playwright test --grep @qualitygate
```

### Test Suites

```typescript
test.describe('Login Tests', () => {
  test('valid login', async ({ page }) => { /* ... */ });
  test('invalid login', async ({ page }) => { /* ... */ });
});
```

## Server Management

Configure your development server in `playwright.config.ts`:

```typescript
// playwright.config.ts
export default defineConfig({
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

Playwright will automatically start and stop your server.

## Best Practices

✅ **DO:**
- Import from `testFixtures/base.ts` (framework)
- Use `data-testid` for stable selectors
- Wait for `networkidle` before inspecting
- Keep tests independent
- Use Page Object Model
- Write descriptive test names

❌ **DON'T:**
- Use brittle CSS selectors
- Inspect DOM before page loads
- Create dependent tests
- Use fixed waits (`wait(5000)`)
- Duplicate test setup

## Troubleshooting

### Browser not installed
```bash
npx playwright install
```

### Tests fail on localhost
Make sure your dev server is running:
```bash
npm run dev
```

### Element not found
- Check element exists in browser DevTools
- Verify page is fully loaded: `await page.waitForLoadState('networkidle')`
- Use Playwright Inspector: `npx playwright test --debug`

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
