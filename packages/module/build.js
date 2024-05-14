/* eslint-disable no-console */
const StyleDictionary = require('style-dictionary');

const build = (selector) => {
  const { fileHeader, formattedVariables } = StyleDictionary.formatHelpers;

  console.log('Build started...');
  console.log('\n============================');

  //Register comment format
  StyleDictionary.registerFormat({
    name: 'customFormat',
    formatter: function ({ dictionary, file, options }) {
      const { outputReferences } = options;
      return (
        fileHeader({ file, commentStyle: 'short' }) +
        `${selector} {\n` +
        formattedVariables({ format: 'css', dictionary, outputReferences }) +
        '\n}\n'
      );
    }
  });

  // Register custom transforms
  StyleDictionary.registerTransform({
    name: 'patternfly/global/px',
    type: 'value',
    matcher: (token) =>
      token.attributes.type === 'breakpoint' ||
      token.attributes.type === 'spacer' ||
      token.attributes.type === 'border' ||
      token.attributes.type === 'icon' ||
      token.attributes.type === 'breakpoint' ||
      (token.attributes.type === 'box-shadow' && token.attributes.item !== 'color') ||
      token.attributes.type === 'font',
    transformer: (token) => `${token.value}px`
  });

  StyleDictionary.registerTransform({
    name: 'patternfly/global/ms',
    type: 'value',
    matcher: (token) =>
      token.attributes.type === 'duration' ||
      token.attributes.type === 'delay',
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

  // Build all
  defaultExtendedSD.buildAllPlatforms();
  darkExtendedSD.buildAllPlatforms();
  paletteExtendedSD.buildAllPlatforms();
  chartsExtendedSD.buildAllPlatforms();
  chartsDarkExtendedSD.buildAllPlatforms();

  console.log('\n============================');
  console.log('\nBuild completed.');
};

module.exports = { build };
