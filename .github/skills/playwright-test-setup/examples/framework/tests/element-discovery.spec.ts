import { test, expect } from '../testFixtures/base';

/**
 * Element Discovery Example
 * Demonstrates how to discover and interact with page elements
 */
test.describe('Element Discovery', () => {
  test('discover all buttons on page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Find all buttons
    const buttons = await page.locator('button').all();
    console.log(`Found ${buttons.length} buttons`);
    
    // Log button details
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const isVisible = await button.isVisible();
      console.log(`  [${i}] "${text?.trim()}" - Visible: ${isVisible}`);
    }
    
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('discover all links on page', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Find all links
    const links = await page.locator('a[href]').all();
    console.log(`Found ${links.length} links`);
    
    // Log first 5 links
    const linkDetails: Array<{ text: string; href: string | null }> = [];
    for (let i = 0; i < Math.min(5, links.length); i++) {
      const link = links[i];
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      linkDetails.push({ text: text?.trim() || '', href });
      console.log(`  - "${text?.trim()}" -> ${href}`);
    }
    
    expect(links.length).toBeGreaterThan(0);
  });

  test('discover all input fields', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Find all input fields
    const inputs = await page.locator('input, textarea, select').all();
    console.log(`Found ${inputs.length} input fields`);
    
    // Log input details
    for (const input of inputs) {
      const name = await input.getAttribute('name') || 
                   await input.getAttribute('id') || 
                   '[unnamed]';
      const type = await input.getAttribute('type') || 'text';
      const placeholder = await input.getAttribute('placeholder') || '';
      console.log(`  - ${name} (${type}) - Placeholder: "${placeholder}"`);
    }
  });

  test('take full page screenshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/discovery-screenshot.png', 
      fullPage: true 
    });
    
    console.log('Screenshot saved to: test-results/discovery-screenshot.png');
  });

  test('discover elements by test-id', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Look for common test-ids
    const commonTestIds = [
      'header',
      'nav',
      'main',
      'footer',
      'logo',
      'menu',
      'search',
      'button',
      'card'
    ];
    
    console.log('Searching for elements with common test-ids:');
    for (const testId of commonTestIds) {
      const elements = await page.getByTestId(testId).all();
      if (elements.length > 0) {
        console.log(`  ✓ Found ${elements.length} element(s) with test-id="${testId}"`);
      }
    }
  });
});
