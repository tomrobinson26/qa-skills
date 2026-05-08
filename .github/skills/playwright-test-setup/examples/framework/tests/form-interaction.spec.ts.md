# Source: form-interaction.spec.ts

```ts
import { test, expect } from '../testFixtures/base';

/**
 * Form Interaction Example
 * Demonstrates form filling and submission
 */
test.describe('Form Interactions', () => {
  test('fill and submit contact form', async ({ page }) => {
    // Navigate to page with form
    await page.goto('http://localhost:3000/contact');
    await page.waitForLoadState('networkidle');
    
    // Fill form using test-ids (preferred)
    await page.getByTestId('name-input').fill('John Doe');
    await page.getByTestId('email-input').fill('john.doe@example.com');
    await page.getByTestId('message-input').fill('This is a test message');
    
    // Submit form
    await page.getByTestId('submit-button').click();
    
    // Verify success message
    await expect(page.getByText('Thank you')).toBeVisible();
  });

  test('form validation works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    
    // Try to submit empty form
    await page.getByTestId('submit-button').click();
    
    // Check for validation errors
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });

  test('fill form using labels', async ({ page }) => {
    await page.goto('http://localhost:3000/contact');
    
    // Fill form using labels (fallback when test-ids unavailable)
    await page.getByLabel('Name').fill('Jane Smith');
    await page.getByLabel(/email/i).fill('jane@example.com');
    await page.getByLabel(/message|comment/i).fill('Test message');
    
    await page.getByRole('button', { name: /submit|send/i }).click();
  });

  test('select dropdown options', async ({ page }) => {
    await page.goto('http://localhost:3000/form');
    
    // Select from dropdown
    await page.getByTestId('country-select').selectOption('USA');
    
    // Or select by label
    await page.getByLabel('Country').selectOption({ label: 'United States' });
    
    // Verify selection
    const value = await page.getByTestId('country-select').inputValue();
    expect(value).toBe('USA');
  });

  test('checkbox and radio button interactions', async ({ page }) => {
    await page.goto('http://localhost:3000/form');
    
    // Check a checkbox
    await page.getByTestId('terms-checkbox').check();
    await expect(page.getByTestId('terms-checkbox')).toBeChecked();
    
    // Select radio button
    await page.getByTestId('option-1').check();
    await expect(page.getByTestId('option-1')).toBeChecked();
  });
});

```
