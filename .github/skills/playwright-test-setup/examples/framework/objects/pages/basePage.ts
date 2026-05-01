import { expect, type Locator, type Page } from '@playwright/test';
import { EnvironmentManager } from '../../utils/environmentManager';

const envManager = new EnvironmentManager();

export class basePage {
  readonly page: Page;
  readonly baseUrl: string;

  //Shared page properties
  url: string;
  readonly h1: Locator;
  readonly breadcrumbs: Locator;
  readonly breadcrumbSchema: Locator;
  readonly header: Locator;
  readonly footer: Locator;

  //SEO & Social locators
  readonly pageTitle: Locator;
  readonly canonicalUrl: Locator;
  readonly ogTitle: Locator;
  readonly ogDescription: Locator;
  readonly ogImage: Locator;
  readonly ogImageAlt: Locator;
  readonly metaRobots: Locator;
  readonly viewportWidth: number;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = envManager.getValue('baseUrl') || '';

    //others
    this.viewportWidth = this.page.viewportSize()?.width || 0;

    //Shared page properties
    this.url = this.baseUrl; // Default to baseUrl, can be overridden in subclasses
    this.h1 = this.page.locator('h1');
    this.breadcrumbs = this.page.getByTestId('breadcrumb');
    this.breadcrumbSchema = this.page.locator('script[type="application/ld+json"]');
    this.header = this.page.locator('header');
    this.footer = this.page.locator('footer');

    //SEO & Social locators
    this.pageTitle = this.page.locator('head title');
    this.canonicalUrl = this.page.locator('link[rel="canonical"]');
    this.ogTitle = this.page.locator('meta[property="og:title"]');
    this.ogDescription = this.page.locator('meta[property="og:description"]');
    this.ogImage = this.page.locator('meta[property="og:image"]');
    this.ogImageAlt = this.page.locator('meta[property="og:image:alt"]');
    this.metaRobots = this.page.locator('meta[name="robots"]');
  }

  /*
  Handles navigation to the page's URL or a custom URL if provided.
  Throws an error if the navigation response status is 400 or higher to stop tests on failed navigation.
  Note: don't use this method if you expect a non-200 response (e.g., testing 404 pages)
  */
  async goto(customUrl?: string): Promise<void> {
    let goToUrl = customUrl || this.url;
    const response = await this.page.goto(goToUrl);
    if (response && response.status() >= 400) {
      throw new Error(`Navigation failed with status ${response.status()}`);
    }
  }

  /* SEO and Quality Checks */
  async verifySEO(): Promise<void> {
    await expect(this.canonicalUrl).toBeAttached();
    await expect.soft(this.pageTitle).toBeAttached();
    await expect.soft(this.ogTitle).toBeAttached();
    await expect.soft(this.ogDescription).toBeAttached();
    await expect.soft(this.metaRobots).toBeAttached();
    await expect.soft(this.page.locator('meta[name="viewport"]')).toBeAttached();
  }

  async checkBrokenImages(): Promise<void> {
    const images = await this.page.$$('img');

    for (const image of images) {
      const naturalWidth = await image.evaluate(img => img.naturalWidth);
      expect.soft(naturalWidth, `image ${image} broken`).toBeGreaterThan(0);
    }
  }

  async checkH1(): Promise<void> {
    await expect.soft(this.h1).toBeAttached();
    await expect.soft(this.h1).toBeVisible();
    await expect.soft(this.h1).toHaveCount(1);
  }

  async checkBreadcrumbs(): Promise<void> {
    await expect.soft(this.breadcrumbs).toBeAttached();
    await expect.soft(this.breadcrumbs).toBeVisible();
    await expect.soft(this.breadcrumbSchema).toBeAttached();

    const schemaContent = JSON.parse(await this.breadcrumbSchema.innerHTML());

    expect.soft(schemaContent).toHaveProperty('@context', 'https://schema.org');
    expect.soft(schemaContent).toHaveProperty('@type', 'BreadcrumbList');
    expect.soft(schemaContent).toHaveProperty('itemListElement');
    expect.soft(schemaContent.itemListElement.length).toBeGreaterThan(0);
    expect.soft(schemaContent.itemListElement[0]).toHaveProperty('@type', 'ListItem');
    expect.soft(schemaContent.itemListElement[0]).toHaveProperty('position', 1);
    expect.soft(schemaContent.itemListElement[0]).toHaveProperty('name');
    expect.soft(schemaContent.itemListElement[0]).toHaveProperty('item', this.baseUrl);
    expect
      .soft(schemaContent.itemListElement.at(-1))
      .toHaveProperty('name', await this.h1.innerText());
  }

  /* Header and Footer Checks */
  async checkHeaderVisible(): Promise<void> {
    await expect(this.header).toBeVisible();
  }

  async checkFooterVisible(): Promise<void> {
    await expect(this.footer).toBeVisible();
  }

  /* General Helpers */
  async isMobile(breakpoint?: number): Promise<boolean> {
    return this.viewportWidth < (breakpoint || 768);
  }

  async closeCookies(): Promise<void> {
    /*
    set onetrust cookie to close cookie banner, speeds up test execution by a LOT.
    this is usually called in the custom base fixture, can be overridden in tests if needed to test cookie banner.
    similar methods could be used for other cookie providers
    */
    const cookieToSet = { name: 'OptanonAlertBoxClosed', value: 'test', url: this.baseUrl };
    await this.page.context().addCookies([cookieToSet]);
  }

  /* Interaction Helpers */
  async drag(locator: Locator): Promise<void> {
    const box = await locator.boundingBox();

    await this.page.mouse.move(box?.x || 0, box?.y || 0);

    await this.page.mouse.down();
    await this.page.mouse.move((box?.x || 0) + 100, box?.y || 0);
    await this.page.mouse.up();
  }

  async dragAndWait(locator: Locator, waitTime = 1000): Promise<void> {
    await this.drag(locator);
    await this.page.waitForTimeout(waitTime);
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  async scrollBottomToTop(): Promise<void> {
    await this.scrollToBottom();
    await this.page.waitForTimeout(500);
    await this.scrollToTop();
  }

  async checkForMovement(locator: Locator, waitTime = 1000) {
    const initialBox = await locator.boundingBox();
    await this.page.waitForTimeout(waitTime);
    const newBox = await locator.boundingBox();

    return [initialBox, newBox];
  }
}
