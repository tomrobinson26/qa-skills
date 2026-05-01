import { Page, Locator } from '@playwright/test';

/**
 * Navigation Component
 * Reusable component for site navigation
 */
export class NavigationComponent {
  private page: Page;
  nav: Locator;
  logo: Locator;
  menuItems: Locator;
  mobileMenuButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nav = page.locator('nav').first();
    this.logo = this.nav.getByTestId('logo');
    this.menuItems = this.nav.getByRole('link');
    this.mobileMenuButton = this.nav.getByTestId('mobile-menu-toggle');
  }

  /**
   * Click on a navigation link by text
   */
  async clickNavLink(text: string) {
    await this.nav.getByRole('link', { name: text }).click();
  }

  /**
   * Get all navigation links
   */
  async getAllNavLinks(): Promise<string[]> {
    const links = await this.menuItems.all();
    const linkTexts: string[] = [];
    
    for (const link of links) {
      const text = await link.textContent();
      if (text) linkTexts.push(text.trim());
    }
    
    return linkTexts;
  }

  /**
   * Toggle mobile menu
   */
  async toggleMobileMenu() {
    if (await this.mobileMenuButton.isVisible()) {
      await this.mobileMenuButton.click();
    }
  }

  /**
   * Check if navigation is visible
   */
  async isVisible(): Promise<boolean> {
    return await this.nav.isVisible();
  }
}
