# Source: basic-test.spec.ts

```ts
import { test, expect } from '../testFixtures/base';

/**
 * Basic test example
 * Demonstrates simple page navigation and assertions
 */
test.describe('Basic Page Tests', () => {
  test('homepage loads correctly @smoke', async ({ basePage }) => {
    // Navigate to homepage
    await basePage.goto('/');
    
    // Verify page loaded
    await expect(basePage.page).toHaveURL(/.*\//);
    
    // Verify common elements are visible
    await expect(basePage.header).toBeVisible();
    await expect(basePage.footer).toBeVisible();
    await expect(basePage.h1).toBeVisible();
    
    // Verify page title
    const title = await basePage.getTitle();
    expect(title).toBeTruthy();
  });

  test('page title is set correctly', async ({ basePage }) => {
    await basePage.goto('/');
    
    const title = await basePage.getTitle();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
  });

  test('no broken images on homepage', async ({ basePage }) => {
    await basePage.goto('/');
    await basePage.waitForPageLoad();
    
    const brokenImages = await basePage.checkBrokenImages();
    expect(brokenImages).toHaveLength(0);
  });

  test('common page elements are visible', async ({ basePage }) => {
    await basePage.goto('/');
    
    await basePage.verifyCommonElements();
  });
});

```
