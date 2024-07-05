/* eslint-disable no-console */
const StyleDictionary = require('style-dictionary');
const config = require('./config.default.json'); // Adjust the path if necessary
const basePxFontSize = config.basePxFontSize || 16;

const build = (selector) => {
  const { fileHeader, formattedVariables, sortByName } = StyleDictionary.formatHelpers;

  console.log('Build started...');
  console.log('\n============================');

  //Register comment format
  StyleDictionary.registerFormat({
    name: 'customFormat',
    formatter: function ({ dictionary, file, options }) {
      const { outputReferences } = options;
      const alphaSort = (a, b) => sortByName(a, b) * -1;
      dictionary.allTokens = dictionary.allTokens.sort(alphaSort);
      return (
        fileHeader({ file, commentStyle: 'short' }) +
        `${selector} {\n` +
        formattedVariables({ format: 'css', dictionary, outputReferences }) +
        '\n}\n'
      );
    }
  });

  StyleDictionary.registerFormat({
    name: 'json/flat',
    formatter: function (dictionary) {
      let tokens = {};
      dictionary.allTokens.map((token) => {
        // assign each token object to token.name
        tokens[token.name] = token;
        // attach references to build token chain
        if (dictionary.usesReference(token.original.value)) {
          token.references = dictionary.getReferences(token.original.value);
        }
      });
      return JSON.stringify(tokens, null, 2);
    }
  });

  // Register custom transforms
  StyleDictionary.registerTransform({
    name: 'patternfly/global/px',
    type: 'value',
    matcher: (token) =>
      token.attributes.type === 'border' ||
      (token.attributes.type === 'box-shadow' && token.attributes.item !== 'color'),
    transformer: (token) => `${token.value}px`
  });

  StyleDictionary.registerTransform({
    name: 'patternfly/global/pxToRem',
    type: 'value',
    matcher: (token) =>
      token.attributes.type === 'spacer' || token.attributes.item === 'size' || token.attributes.type === 'breakpoint',
    transformer: (token) => `${token.value / basePxFontSize}rem`
  });

  StyleDictionary.registerTransform({
    name: 'patternfly/global/ms',
    type: 'value',
    matcher: (token) => token.attributes.type === 'duration' || token.attributes.type === 'delay',
    transformer: (token) => `${token.value}ms`
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
      'patternfly/global/pxToRem',
      'patternfly/global/ms',
      'patternfly/doublekebab'
    ]
  });

  // Apply configuration
  const defaultExtendedSD = StyleDictionary.extend(__dirname + '/config.default.json');
  const darkExtendedSD = StyleDictionary.extend(__dirname + '/config.dark.json');
  const paletteExtendedSD = StyleDictionary.extend(__dirname + '/config.palette-colors.json');
  const chartsExtendedSD = StyleDictionary.extend(__dirname + '/config.charts.json');
  const chartsDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.charts.dark.json');
  const allDefaultSD = StyleDictionary.extend(__dirname + '/config.all.default.json');
  const allDarkSD = StyleDictionary.extend(__dirname + '/config.all.dark.json');

  // Build all
  defaultExtendedSD.buildAllPlatforms();
  darkExtendedSD.buildAllPlatforms();
  paletteExtendedSD.buildAllPlatforms();
  chartsExtendedSD.buildAllPlatforms();
  chartsDarkExtendedSD.buildAllPlatforms();
  allDefaultSD.buildAllPlatforms();
  allDarkSD.buildAllPlatforms();

  console.log('\n============================');
  console.log('\nBuild completed.');
};

module.exports = { build };
