# Source: cardComponent.ts

```ts
import { Page, Locator } from '@playwright/test';

/**
 * Card Component
 * Reusable component for card-based UI elements
 */
export class CardComponent {
  private page: Page;
  card: Locator;
  title: Locator;
  image: Locator;
  link: Locator;

  constructor(page: Page, cardTestId: string = 'card') {
    this.page = page;
    this.card = page.getByTestId(cardTestId);
    this.title = this.card.getByTestId('card-title');
    this.image = this.card.getByTestId('card-image');
    this.link = this.card.getByRole('link');
  }

  /**
   * Get all cards on the page
   */
  async getAllCards(): Promise<Locator[]> {
    return await this.page.getByTestId('card').all();
  }

  /**
   * Click on a specific card
   */
  async clickCard(index: number = 0) {
    const cards = await this.getAllCards();
    if (cards[index]) {
      await cards[index].click();
    }
  }

  /**
   * Get card title text
   */
  async getCardTitle(index: number = 0): Promise<string> {
    const cards = await this.getAllCards();
    if (cards[index]) {
      const title = cards[index].getByTestId('card-title');
      return await title.textContent() || '';
    }
    return '';
  }

  /**
   * Check if card image is loaded
   */
  async isImageLoaded(index: number = 0): Promise<boolean> {
    const cards = await this.getAllCards();
    if (cards[index]) {
      const img = cards[index].getByTestId('card-image');
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      return naturalWidth > 0;
    }
    return false;
  }
}

```
