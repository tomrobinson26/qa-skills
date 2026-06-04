# Source: package.json

```json
{
  "name": "playwright-testing-framework",
  "version": "1.0.0",
  "description": "Playwright TypeScript E2E testing framework with Page Object Model",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:qa": "ENV=qa playwright test",
    "test:staging": "ENV=staging playwright test",
    "test:update": "npm install @playwright/test@latest",
    "test:install": "playwright install",
    "format": "prettier --write ."
  },
  "keywords": ["playwright", "typescript", "e2e", "testing"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@playwright/test": "1.57.0",
    "@types/node": "24.7.0",
    "playwright-testmo-reporter": "1.17.0",
    "typescript": "^5.7.2"
  },
  "dependencies": {
    "@axe-core/playwright": "4.11.0",
    "@testmo/testmo-cli": "1.4.6",
    "dotenv": "17.2.3",
    "get-port": "7.1.0",
    "playwright": "1.57.0",
    "playwright-lighthouse": "4.0.0",
    "prettier": "3.6.2"
  }
}

```
