import { test, expect } from '../testFixtures/base';
import { qualityGate } from '../testFixtures/base';

/**
 * Quality Gate Tests
 * Comprehensive quality checks for critical pages
 */
test.describe('Quality Gate Tests @qualitygate', () => {
  test('homepage passes quality gate', async ({ basePage }) => {
    await qualityGate(basePage, '/');
  });

  test('SEO meta tags are present', async ({ basePage }) => {
    await basePage.goto('/');
    
    // Check title
    const title = await basePage.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
    expect(title.length).toBeLessThanOrEqual(60);
    
    // Check meta description
    const description = await basePage.getMetaContent('description');
    expect(description).toBeTruthy();
    if (description) {
      expect(description.length).toBeGreaterThan(50);
      expect(description.length).toBeLessThanOrEqual(160);
    }
    
    // Check canonical URL (if applicable)
    const canonical = await basePage.page.locator('link[rel="canonical"]').getAttribute('href');
    if (canonical) {
      expect(canonical).toContain('http');
    }
  });

  test('no broken images', async ({ basePage }) => {
    await basePage.goto('/');
    await basePage.waitForPageLoad();
    
    const brokenImages = await basePage.checkBrokenImages();
    
    if (brokenImages.length > 0) {
      console.error('Broken images found:');
      brokenImages.forEach(src => console.error(`  - ${src}`));
    }
    
    expect(brokenImages).toHaveLength(0);
  });

  test('header and footer are visible', async ({ basePage }) => {
    await basePage.goto('/');
    
    await expect(basePage.header).toBeVisible();
    await expect(basePage.footer).toBeVisible();
  });

  test('H1 tag exists and is unique', async ({ basePage }) => {
    await basePage.goto('/');
    
    const h1Elements = await basePage.page.locator('h1').all();
    
    // Should have exactly one H1
    expect(h1Elements.length).toBe(1);
    
    // H1 should have content
    const h1Text = await h1Elements[0].textContent();
    expect(h1Text?.trim()).toBeTruthy();
    expect(h1Text!.trim().length).toBeGreaterThan(0);
  });

  test('page loads within acceptable time', async ({ basePage }) => {
    const startTime = Date.now();
    
    await basePage.goto('/');
    await basePage.waitForPageLoad();
    
    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
