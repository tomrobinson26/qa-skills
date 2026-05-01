import { test, expect } from '../testFixtures/base';

/**
 * Console Logging Example
 * Demonstrates how to capture and analyze browser console logs
 */
test.describe('Console Logging', () => {
  test('capture console logs during page load', async ({ page }) => {
    const logs: Array<{ type: string; text: string }> = [];
    
    // Set up console log capture
    page.on('console', msg => {
      logs.push({
        type: msg.type(),
        text: msg.text()
      });
      console.log(`Console [${msg.type()}]: ${msg.text()}`);
    });
    
    // Navigate and interact with page
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Log summary
    console.log(`\nCaptured ${logs.length} console messages:`);
    console.log(`  - Errors: ${logs.filter(l => l.type === 'error').length}`);
    console.log(`  - Warnings: ${logs.filter(l => l.type === 'warning').length}`);
    console.log(`  - Logs: ${logs.filter(l => l.type === 'log').length}`);
    
    // Assert no console errors
    const errors = logs.filter(l => l.type === 'error');
    if (errors.length > 0) {
      console.error('\nConsole errors found:');
      errors.forEach(err => console.error(`  - ${err.text}`));
    }
    
    expect(errors).toHaveLength(0);
  });

  test('capture network failures', async ({ page }) => {
    const failedRequests: Array<{ url: string; status: number }> = [];
    
    // Set up request failure capture
    page.on('response', response => {
      if (response.status() >= 400) {
        failedRequests.push({
          url: response.url(),
          status: response.status()
        });
        console.log(`Failed request: ${response.status()} - ${response.url()}`);
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Log failed requests
    if (failedRequests.length > 0) {
      console.log(`\nFound ${failedRequests.length} failed requests:`);
      failedRequests.forEach(req => {
        console.log(`  - ${req.status}: ${req.url}`);
      });
    }
    
    // Assert no critical failures (500s)
    const serverErrors = failedRequests.filter(r => r.status >= 500);
    expect(serverErrors).toHaveLength(0);
  });

  test('monitor JavaScript errors', async ({ page }) => {
    const jsErrors: string[] = [];
    
    // Capture page errors
    page.on('pageerror', error => {
      jsErrors.push(error.message);
      console.error(`JavaScript Error: ${error.message}`);
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Interact with page to trigger potential errors
    await page.click('button').catch(() => {}); // Safe click
    
    if (jsErrors.length > 0) {
      console.error(`\nFound ${jsErrors.length} JavaScript errors:`);
      jsErrors.forEach(err => console.error(`  - ${err}`));
    }
    
    expect(jsErrors).toHaveLength(0);
  });
});
