/* eslint-disable no-console */
const StyleDictionary = require('style-dictionary');

const build = (selector) => {
  const { fileHeader, formattedVariables, sortByName, sortByReference } = StyleDictionary.formatHelpers;
  const getTokenLayer = ({ filePath }) => {
    if (filePath.includes('semantic.json')) return ['semantic', 'colors'];
    if (filePath.includes('semantic.dark.json')) return ['semantic', 'colors'];
    if (filePath.includes('semantic.dimension.json')) return ['semantic', 'dimension'];
    if (filePath.includes('semantic.motion.json')) return ['semantic', 'motion'];
    if (filePath.includes('base.json')) return ['base', 'colors'];
    if (filePath.includes('base.dark.json')) return ['base', 'colors'];
    if (filePath.includes('base.dimension.json')) return ['base', 'dimension'];
    if (filePath.includes('base.motion.json')) return ['base', 'motion'];
    if (filePath.includes('palette.color.json')) return ['palette'];
    return ['palette'];
  };

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

  StyleDictionary.registerFormat({
    name: 'json/flat-categories',
    formatter: function (dictionary) {
      let tokens = {
        semantic: {
          colors: {},
          dimension: {},
          motion: {}
        },
        base: {
          colors: {},
          dimension: {},
          motion: {}
        },
        palette: {}
      };
      dictionary.allTokens.map((token) => {
        // determine token type based on tokens filepath
        const layer = getTokenLayer(token);
        let insertLayer = tokens;
        while (layer.length) {
          insertLayer = insertLayer[layer.shift()];
        }
        // assign each token object to token.name
        insertLayer[token.name] = token;
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
      token.attributes.type === 'spacer' ||
      token.attributes.type === 'border' ||
      token.attributes.type === 'icon' ||
      token.attributes.type === 'breakpoint' ||
      (token.attributes.type === 'box-shadow' && token.attributes.item !== 'color') ||
      (token.attributes.type === 'font' && token.attributes.item === 'size'),
    transformer: (token) => `${token.value}px`
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
  const semanticSD = StyleDictionary.extend(__dirname + '/config.semantic.json');
  const semanticDarkSD = StyleDictionary.extend(__dirname + '/config.semantic.dark.json');

  // Build all
  defaultExtendedSD.buildAllPlatforms();
  darkExtendedSD.buildAllPlatforms();
  paletteExtendedSD.buildAllPlatforms();
  chartsExtendedSD.buildAllPlatforms();
  chartsDarkExtendedSD.buildAllPlatforms();
  allDefaultSD.buildAllPlatforms();
  allDarkSD.buildAllPlatforms();
  semanticSD.buildAllPlatforms();
  semanticDarkSD.buildAllPlatforms();

  console.log('\n============================');
  console.log('\nBuild completed.');
};

module.exports = { build };
