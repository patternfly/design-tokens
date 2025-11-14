const { fullscreenRoutes } = require('@patternfly/documentation-framework/routes');

/**
 * Wait for a selector before running axe
 *
 * @param page page from puppeteer
 */
async function waitFor(page) {
  await page.waitForSelector('#root > *');
}

module.exports = {
  prefix: 'http://localhost:5000',
  waitFor,
  crawl: false,
  urls: ['/','/foundations-and-styles/design-tokens/all-design-tokens'],
  ignoreRules: [
    'color-contrast',
    'landmark-no-duplicate-main',
    'landmark-main-is-top-level',
    'scrollable-region-focusable'
  ].join(','),
  ignoreIncomplete: true
};
