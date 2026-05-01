import { defineConfig } from '@playwright/test';
import { TestmoReporterOptions } from 'playwright-testmo-reporter';
import { projects } from './config/projects';
import { EnvironmentManager } from './utils/environmentManager';
const envManager = new EnvironmentManager();

/**
 * See https://playwright.dev/docs/test-configuration.
*/

const junitOptions = {
  embedAnnotationsAsProperties: true,
  outputFile: '.test-reports/junit-report.xml',
};

export default defineConfig({
  /* directory where the tests are located */
  testDir: './tests',
  /* directory for visual screenshots */
  snapshotPathTemplate: `./screenshots/${envManager.getEnv()}/{projectName}/{arg}{ext}`,
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05, //tolerance of 5% difference
    },
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* run with 2 workers on CI */
  workers: process.env.CI ? 2 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list', { printSteps: true }],
    ['junit', junitOptions],
    [
      'playwright-testmo-reporter',
      {
        outputFile: '.test-reports/testmo.xml',
        embedBrowserType: true,
      } satisfies TestmoReporterOptions,
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: envManager.getValue('baseUrl'),

    /* run headless on CI only. */
    headless: process.env.CI ? true : false,

    /* Artifacts */
    screenshot: 'on-first-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: './.test-results/',

  /* Configure projects for major browsers, defined in config/projects.ts */
  projects: projects,
});
