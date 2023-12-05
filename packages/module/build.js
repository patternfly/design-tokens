/* eslint-disable no-console */
const StyleDictionary = require('style-dictionary');

console.log('Build started...');
console.log('\n============================');

// Register custom transforms
StyleDictionary.registerTransform({
  name: 'patternfly/global/px',
  type: 'value',
  matcher: (token) =>
    token.attributes.type === 'spacer' ||
    token.attributes.type === 'border' ||
    token.attributes.type === 'icon' ||
    token.attributes.type === 'font',
  transformer: (token) => `${token.value}px`
});

StyleDictionary.registerTransform({
  name: 'patternfly/doublekebab',
  type: 'name',
  transformer: (token, options) => `${options.prefix}--${token.path.join('--')}`
});

// Reigster custom transform group
StyleDictionary.registerTransformGroup({
  name: 'patternfly/css',
  transforms: [
    // "css" group transforms
    'attribute/cti',
    // 'name/cti/kebab' -- replaced with "patternfly/doublekebab"
    'time/seconds',
    'content/icon',
    'size/rem',
    'color/css',
    // custom transforms
    'patternfly/global/px',
    'patternfly/doublekebab'
  ]
});

// Apply configuration
const defaultExtendedSD = StyleDictionary.extend(__dirname + '/config.default.json');
const darkExtendedSD = StyleDictionary.extend(__dirname + '/config.dark.json');
const paletteExtendedSD = StyleDictionary.extend(__dirname + '/config.palette-colors.json');

// Build all
defaultExtendedSD.buildAllPlatforms();
darkExtendedSD.buildAllPlatforms();
paletteExtendedSD.buildAllPlatforms();

console.log('\n============================');
console.log('\nBuild completed.');
