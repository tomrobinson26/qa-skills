import AxeBuilder from '@axe-core/playwright';
import { test as base, Browser, chromium, expect, Page } from '@playwright/test';
import getPort from 'get-port';
import { playAudit } from 'playwright-lighthouse';
import { basePage } from '../objects/pages/basePage';
import { pages } from '../types/pages';

async function setupPage(pageInstance: pages[keyof pages]) {
  // Global setup actions such as closing cookie banner
  await pageInstance.closeCookies();
}

function createPageFixture<T extends pages[keyof pages]>(PageClass: new (page: Page) => T) {
  return async ({ page }: { page: Page }, use: (page: T) => Promise<void>) => {
    const pageInstance = new PageClass(page);
    await setupPage(pageInstance);
    await use(pageInstance);
  };
}

type AccessibilityFixture = {
  accessibility: (pageInstance: pages[keyof pages], customUrl?: string) => Promise<void>;
};

type QualityGateFixture = {
  qualityGate: (pageInstance: pages[keyof pages], customUrl?: string) => Promise<void>;
};

type LighthouseFixture = {
  lighthouse: (
    pageInstance: pages[keyof pages],
    thresholds: Record<string, number>,
    customUrl?: string
  ) => Promise<void>;
};

type LighthouseWorkerFixtures = {
  lighthousePort: number;
  lighthouseBrowser: Browser;
};

export const test = base.extend<
  pages & AccessibilityFixture & QualityGateFixture & LighthouseFixture,
  LighthouseWorkerFixtures
>({
  lighthouse: async ({ lighthouseBrowser, lighthousePort }, use) => {
    const runLighthouse = async (
      pageInstance: pages[keyof pages],
      thresholds: Record<string, number>,
      customUrl?: string
    ) => {
      const context = await lighthouseBrowser.newContext();
      const page = await context.newPage();
      // Create a temporary page object instance for navigation
      const tempPageInstance = new (pageInstance.constructor as any)(page);
      await tempPageInstance.goto(customUrl);
      await playAudit({ page: page as any, port: lighthousePort, thresholds });
      await context.close();
    };
    await use(runLighthouse);
  },

  lighthousePort: [
    async ({}, use) => {
      // Assign a unique port for each playwright worker to support parallel tests
      const port = await getPort();
      await use(port);
    },
    { scope: 'worker' },
  ],

  lighthouseBrowser: [
    async ({ lighthousePort }, use) => {
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${lighthousePort}`],
      });
      await use(browser);
      await browser.close();
    },
    { scope: 'worker' },
  ],

  qualityGate: async ({ page }, use) => {
    const runQualityGate = async (pageInstance: pages[keyof pages], customUrl?: string) => {
      await pageInstance.goto(customUrl);
      await pageInstance.verifySEO();
      await pageInstance.checkBrokenImages();
      await pageInstance.checkHeaderVisible();
      await pageInstance.checkH1();
      await pageInstance.checkFooterVisible();
    };
    await use(runQualityGate);
  },

  accessibility: async ({ page }, use) => {
    const runAccessibilityTest = async (pageInstance: pages[keyof pages], customUrl?: string) => {
      await pageInstance.goto(customUrl);
      const axeBuilder = new AxeBuilder({
        page: pageInstance.page as any,
      }).withTags(['wcag2a', 'wcag2aa']);
      const accessibilityScanResults = await axeBuilder.analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    };
    await use(runAccessibilityTest);
  },

  //page types
  basePage: createPageFixture(basePage),
  /* Add other page types here as needed, make sure to import them */
});

export { expect } from '@playwright/test';
