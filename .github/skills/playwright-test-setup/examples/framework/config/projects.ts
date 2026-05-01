import { devices, Project } from '@playwright/test';

/**
 * Browser configuration for different devices and screen sizes
 * See https://playwright.dev/docs/test-projects
 */
export const projects: Project[] = [
  {
    name: 'chromium',
    use: { 
      ...devices['Desktop Chrome'],
      viewport: { width: 1280, height: 720 }
    },
  },

  {
    name: 'firefox',
    use: { 
      ...devices['Desktop Firefox'],
      viewport: { width: 1280, height: 720 }
    },
  },

  {
    name: 'webkit',
    use: { 
      ...devices['Desktop Safari'],
      viewport: { width: 1280, height: 720 }
    },
  },

  /* Test against mobile viewports */
  {
    name: 'Mobile Chrome',
    use: { 
      ...devices['Pixel 7'],
    },
  },
  {
    name: 'Mobile Safari',
    use: { 
      ...devices['iPhone 14'],
    },
  },

  /* Test against tablet viewports */
  {
    name: 'Mobile Tablet Chrome',
    use: {
      ...devices['Pixel 7'],
      viewport: { width: 1024, height: 810 },
      hasTouch: true,
    },
  },
  {
    name: 'Mobile Tablet Safari',
    use: {
      ...devices['iPad Mini landscape'],
    },
  },

  /* Test against branded browsers */
  // {
  //   name: 'Microsoft Edge',
  //   use: { 
  //     ...devices['Desktop Edge'],
  //     channel: 'msedge',
  //     viewport: { width: 1920, height: 1080 }
  //   },
  // },
  // {
  //   name: 'Google Chrome',
  //   use: { 
  //     ...devices['Desktop Chrome'],
  //     channel: 'chrome',
  //     viewport: { width: 1920, height: 1080 }
  //   },
  // },
];
