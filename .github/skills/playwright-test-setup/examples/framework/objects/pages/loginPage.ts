import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Example: Login Page Object
 * Demonstrates how to create a page object for a login page
 */
export class LoginPage extends BasePage {
  url = '/login';
  
  // Page elements
  usernameInput: Locator;
  passwordInput: Locator;
  submitButton: Locator;
  errorMessage: Locator;
  forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using data-testid (preferred)
    this.usernameInput = page.getByTestId('username-input');
    this.passwordInput = page.getByTestId('password-input');
    this.submitButton = page.getByTestId('submit-button');
    this.errorMessage = page.getByTestId('error-message');
    
    // Fallback to other locator strategies if needed
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  /**
   * Perform login with credentials
   */
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Check if error message is displayed
   */
  async hasError(): Promise<boolean> {
    return await this.errorMessage.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Verify login page loaded correctly
   */
  async verifyPageLoaded() {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.submitButton.waitFor({ state: 'visible' });
  }
}
