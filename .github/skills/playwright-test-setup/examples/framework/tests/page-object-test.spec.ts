import { test, expect } from '../testFixtures/base';
import { LoginPage } from '../objects/pages/loginPage';

/**
 * Page Object Model Test Example
 * Demonstrates using page objects in tests
 * 
 * Note: To use this, you need to:
 * 1. Add LoginPage to types/pages.ts
 * 2. Register loginPage fixture in testFixtures/base.ts
 */

test.describe('Login Page Tests', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('login page loads correctly', async () => {
    await loginPage.verifyPageLoaded();
    
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('successful login redirects to dashboard @smoke', async ({ page }) => {
    await loginPage.login('testuser@example.com', 'password123');
    
    // Wait for redirect
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('invalid credentials show error message', async () => {
    await loginPage.login('invalid@example.com', 'wrongpassword');
    
    // Check for error
    await expect(loginPage.errorMessage).toBeVisible();
    
    const errorText = await loginPage.getErrorMessage();
    expect(errorText).toContain('Invalid');
  });

  test('forgot password link works', async ({ page }) => {
    await loginPage.clickForgotPassword();
    
    await page.waitForURL('**/forgot-password');
    expect(page.url()).toContain('/forgot-password');
  });

  test('empty form shows validation errors', async () => {
    await loginPage.submitButton.click();
    
    // Should show validation errors
    await expect(loginPage.page.getByText(/required/i)).toBeVisible();
  });
});

/**
 * Alternative: Using fixtures (recommended)
 * 
 * After registering LoginPage in testFixtures/base.ts:
 */
/*
test.describe('Login Tests with Fixtures', () => {
  test('login works', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password');
    await expect(loginPage.page).toHaveURL(/dashboard/);
  });
});
*/
