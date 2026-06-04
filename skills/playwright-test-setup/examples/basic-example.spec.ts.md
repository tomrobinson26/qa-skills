# Source: basic-example.spec.ts

```ts
import { test, expect } from '@playwright/test';

/**
 * Basic Playwright TypeScript Example
 * 
 * This is a standalone example that doesn't require the full framework.
 * Run with: npx playwright test basic-example.spec.ts
 */

test('discover buttons on page', async ({ page }) => {
  // Navigate to the page
  await page.goto('http://localhost:3000');
  
  // CRITICAL: Wait for JavaScript to execute
  await page.waitForLoadState('networkidle');
  
  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons:`);
  
  // Log button details
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const isVisible = await button.isVisible();
    console.log(`  [${i}] "${text?.trim()}" - Visible: ${isVisible}`);
  }
  
  expect(buttons.length).toBeGreaterThan(0);
});

test('discover links on page', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Find all links
  const links = await page.locator('a[href]').all();
  console.log(`\nFound ${links.length} links:`);
  
  // Show first 5 links
  for (let i = 0; i < Math.min(5, links.length); i++) {
    const link = links[i];
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    console.log(`  - "${text?.trim()}" -> ${href}`);
  }
});

test('discover input fields', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Find all input fields
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`\nFound ${inputs.length} input fields:`);
  
  for (const input of inputs) {
    const name = await input.getAttribute('name') || 
                 await input.getAttribute('id') || 
                 '[unnamed]';
    const type = await input.getAttribute('type') || 'text';
    console.log(`  - ${name} (${type})`);
  }
});

test('take screenshot', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  
  // Take full page screenshot
  await page.screenshot({ 
    path: 'page-discovery.png', 
    fullPage: true 
  });
  
  console.log('\nScreenshot saved to: page-discovery.png');
});

```
