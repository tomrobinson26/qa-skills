import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Static HTML Testing Example
 * Demonstrates testing local HTML files using file:// URLs
 */

test('test static HTML file', async ({ page }) => {
  // Path to your HTML file (adjust as needed)
  const htmlFilePath = path.resolve(__dirname, 'sample.html');
  const fileUrl = `file://${htmlFilePath}`;
  
  console.log(`Loading: ${fileUrl}`);
  
  // Navigate to local file
  await page.goto(fileUrl);
  
  // Take screenshot
  await page.screenshot({ 
    path: 'static-page.png', 
    fullPage: true 
  });
  
  // Interact with elements
  await page.click('text=Click Me');
  await page.fill('#name', 'John Doe');
  await page.fill('#email', 'john@example.com');
  
  // Submit form
  await page.click('button[type="submit"]');
  await page.waitForTimeout(500);
  
  // Take final screenshot
  await page.screenshot({ 
    path: 'static-page-after-submit.png', 
    fullPage: true 
  });
  
  console.log('Screenshots saved!');
});

test('read HTML content directly', async ({ page }) => {
  const htmlFilePath = path.resolve(__dirname, 'sample.html');
  const fileUrl = `file://${htmlFilePath}`;
  
  await page.goto(fileUrl);
  
  // Get page title
  const title = await page.title();
  console.log(`Page title: ${title}`);
  
  // Find all headings
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('Headings:', headings);
  
  // Find all form inputs
  const inputs = await page.locator('input, textarea').all();
  console.log(`Found ${inputs.length} form inputs`);
});
