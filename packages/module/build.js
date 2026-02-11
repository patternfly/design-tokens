/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const StyleDictionary = require('style-dictionary');
const config = require('./config.default.json'); // Adjust the path if necessary
const basePxFontSize = config.basePxFontSize || 16;
const getTokenLayer = ({ filePath }) => {
  if (filePath.includes('semantic.json')) return ['semantic', 'colors'];
  if (filePath.includes('semantic.dark.json')) return ['semantic', 'colors'];
  if (filePath.includes('semantic.glass.json')) return ['semantic', 'colors'];
  if (filePath.includes('semantic.glass.dark.json')) return ['semantic', 'colors'];
  if (filePath.includes('semantic.dimension.json')) return ['semantic', 'dimension'];
  if (filePath.includes('semantic.dimension.highcontrast.json')) return ['semantic', 'dimension'];
  if (filePath.includes('semantic.motion.json')) return ['semantic', 'motion'];
  if (filePath.includes('base.json')) return ['base', 'colors'];
  if (filePath.includes('base.dark.json')) return ['base', 'colors'];
  if (filePath.includes('base.dimension.json')) return ['base', 'dimension'];
  if (filePath.includes('base.motion.json')) return ['base', 'motion'];
  if (filePath.includes('chart')) return ['chart'];
  if (filePath.includes('palette.color.json')) return ['palette'];
  if (filePath.includes('semantic.highcontrast.json')) return ['semantic', 'colors'];
  if (filePath.includes('semantic.highcontrast.dark.json')) return ['semantic', 'colors'];
  return ['palette'];
};
// returns subdirectory within 'tokens' directory (ex: default, dark, etc)
const getTheme = ({ filePath }) => /tokens\/([^\/]*)\//gm.exec(filePath)[1];

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
        palette: {},
        chart: {}
      };
      dictionary.allTokens.map((token) => {
        // determine token type based on tokens filepath
        const theme = getTheme(token);
        const layer = getTokenLayer(token);
        let insertLayer = tokens;
        while (layer.length) {
          insertLayer = insertLayer[layer.shift()];
        }
        // assign each token object to token.name
        insertLayer[token.name] = {};
        insertLayer[token.name][theme] = token;
        // attach references to build token chain
        if (dictionary.usesReference(token.original.value)) {
          token.references = dictionary.getReferences(token.original.value);
        }
      });
      return JSON.stringify(tokens, null, 2);
    }
  });

  // Register light-dark formatter
  StyleDictionary.registerFormat({
    name: 'css/light-dark',
    formatter: function ({ dictionary, file, options }) {
      const { outputReferences } = options;

      // Import token-merger utility
      const { buildTokenPairMap, resolveTokenValue, getDefaultLightValue, isDarkOnlyBaseToken } = require('./utils/token-merger');

      // Build and load dark dictionary
      // We need to manually transform dark tokens similar to how they're processed for the light theme
      const darkConfig = require('./config.dark.json');
      const darkSD = StyleDictionary.extend(darkConfig);

      // Get the transform group for CSS platform
      const transformGroup = darkSD.platforms.css.transformGroup;
      const transforms = StyleDictionary.transformGroup[transformGroup];

      // Apply transforms to dark tokens
      const prefix = darkSD.platforms.css.prefix || '';

      // Helper to recursively transform tokens
      function transformToken(token, transforms, options) {
        let transformedToken = { ...token };

        // Apply each transform in sequence
        if (transforms && Array.isArray(transforms)) {
          transforms.forEach(transformName => {
            const transform = StyleDictionary.transform[transformName];
            if (transform) {
              // Check if transform matcher matches
              if (!transform.matcher || transform.matcher(transformedToken)) {
                if (transform.type === 'value' && transform.transformer) {
                  transformedToken.value = transform.transformer(transformedToken, options);
                } else if (transform.type === 'name' && transform.transformer) {
                  transformedToken.name = transform.transformer(transformedToken, options);
                }
              }
            }
          });
        }

        return transformedToken;
      }

      // Flatten and transform dark properties
      function flattenAndTransform(obj, result = [], path = []) {
        if (obj.value !== undefined) {
          const token = {
            ...obj,
            path: [...path],
            name: path.join('--'),
            attributes: {}
          };

          // Add CTI attributes
          if (path.length > 0) {
            token.attributes.category = path[0];
          }
          if (path.length > 1) {
            token.attributes.type = path[1];
          }
          if (path.length > 2) {
            token.attributes.item = path[2];
          }

          // Store original value
          token.original = { ...obj };

          // Transform the token
          const transformed = transformToken(token, transforms, { prefix });
          result.push(transformed);
        } else {
          for (let key in obj) {
            if (typeof obj[key] === 'object' && key !== 'attributes') {
              flattenAndTransform(obj[key], result, [...path, key]);
            }
          }
        }
        return result;
      }

      const darkTokens = flattenAndTransform(darkSD.properties);

      const darkDictionary = {
        allTokens: darkTokens,
        usesReference: (value) => dictionary.usesReference(value),
        getReferences: (value) => dictionary.getReferences(value)
      };

      // Build map of light/dark token pairs
      const tokenPairs = buildTokenPairMap(
        dictionary.allTokens,
        darkDictionary.allTokens
      );

      // Separate dark base tokens from composite tokens
      const darkBaseTokens = [];
      const compositeTokens = [];

      tokenPairs.forEach(pair => {
        // If there's a dark token and it's a base token, add it to the dark base tokens list
        if (pair.dark && isDarkOnlyBaseToken(pair.dark)) {
          darkBaseTokens.push(pair);
        }
        // All tokens go into composite tokens (this includes pairs that also have dark base tokens)
        compositeTokens.push(pair);
      });

      // Generate CSS for dark base tokens (with original --dark-- names)
      const darkBaseVars = darkBaseTokens.map(({ dark }) => {
        const darkVal = resolveTokenValue(dark, darkDictionary, outputReferences);
        return `  --${dark.name}: ${darkVal};`;
      }).filter(Boolean).join('\n');

      // Generate CSS for composite tokens (with light-dark() syntax)
      const compositeVars = compositeTokens.map(({ normalizedName, light, dark }) => {
        let lightVal, darkVal;

        if (light && dark) {
          // Both exist - use light-dark()
          lightVal = resolveTokenValue(light, dictionary, outputReferences);
          darkVal = resolveTokenValue(dark, darkDictionary, outputReferences);
          return `  --${normalizedName}: light-dark(${lightVal}, ${darkVal});`;
        } else if (light) {
          // Light only - output direct value without light-dark()
          lightVal = resolveTokenValue(light, dictionary, outputReferences);
          return `  --${normalizedName}: ${lightVal};`;
        } else if (dark) {
          // Dark only (not a base token) - create light-dark with sensible default
          darkVal = resolveTokenValue(dark, darkDictionary, outputReferences);
          lightVal = getDefaultLightValue(dark, darkVal);
          return `  --${normalizedName}: light-dark(${lightVal}, ${darkVal});`;
        }
      }).filter(Boolean).join('\n');

      // Combine both sections with a comment separator
      let cssVars = '';
      if (darkBaseVars) {
        cssVars += '  // Dark base tokens (referenced by semantic tokens in dark mode)\n';
        cssVars += darkBaseVars;
        if (compositeVars) {
          cssVars += '\n\n  // Composite tokens (light-dark values)\n';
        }
      }
      cssVars += compositeVars;

      return fileHeader({ file, commentStyle: 'short' }) +
        `${selector} {\n${cssVars}\n}\n`;
    }
  });

  // Register custom transforms
  StyleDictionary.registerTransform({
    name: 'patternfly/global/px',
    type: 'value',
    matcher: (token) =>
      (['border', 'focus-ring'].includes(token.attributes.type) && token.original.type === 'number') ||
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

  StyleDictionary.registerTransform({
    name: 'patternfly/global/round-decimel',
    type: 'value',
    matcher: (token) => token.type === 'number',
    transformer: (token) => {
      return Math.round(parseFloat(token.value) * 100) / 100;
    }
  });

  StyleDictionary.registerTransform({
    name: 'patternfly/global/percentage',
    type: 'value',
    matcher: (token) => token.attributes.item === 'opacity' && token.original.type === 'number',
    transformer: (token) => `${token.value}%`
  });
  
  StyleDictionary.registerTransform({
    name: 'patternfly/global/filter/blur',
    type: 'value',
    matcher: (token) => (token.attributes.item == 'filter' && token.attributes.state === 'blur' && token.original.type === 'number'),
    transformer: (token) => `blur(${token.value}px)`
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
      'patternfly/global/round-decimel',
      'patternfly/global/percentage',
      'patternfly/global/px',
      'patternfly/global/pxToRem',
      'patternfly/global/ms',
      'patternfly/doublekebab',
      'patternfly/global/filter/blur'
    ]
  });

  // Build all themes
  console.log('Building base themes...');
  const defaultExtendedSD = StyleDictionary.extend(__dirname + '/config.default.json');
  defaultExtendedSD.buildAllPlatforms();

  const darkExtendedSD = StyleDictionary.extend(__dirname + '/config.dark.json');
  darkExtendedSD.buildAllPlatforms();

  // Build light-dark unified theme
  console.log('Building light-dark unified theme...');
  const lightDarkSD = StyleDictionary.extend(__dirname + '/config.light-dark.json');
  lightDarkSD.buildAllPlatforms();

  // Step 2: Build other non-glass themes (order doesn't matter)
  console.log('Building other themes...');
  const paletteExtendedSD = StyleDictionary.extend(__dirname + '/config.palette-colors.json');
  paletteExtendedSD.buildAllPlatforms();

  const chartsExtendedSD = StyleDictionary.extend(__dirname + '/config.charts.json');
  chartsExtendedSD.buildAllPlatforms();

  const chartsDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.charts.dark.json');
  chartsDarkExtendedSD.buildAllPlatforms();

  const highContrastDefaultExtendedSD = StyleDictionary.extend(__dirname + '/config.highcontrast.json');
  highContrastDefaultExtendedSD.buildAllPlatforms();

  const highContrastDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.highcontrast.dark.json');
  highContrastDarkExtendedSD.buildAllPlatforms();

  const layersSD = StyleDictionary.extend(__dirname + '/config.layers.json');
  layersSD.buildAllPlatforms();

  const layersDarkSD = StyleDictionary.extend(__dirname + '/config.layers.dark.json');
  layersDarkSD.buildAllPlatforms();

  console.log('Building layer configs for glass themes...');
  const layersGlassSD = StyleDictionary.extend(__dirname + '/config.layers.glass.json');
  layersGlassSD.buildAllPlatforms();

  const layersGlassDarkSD = StyleDictionary.extend(__dirname + '/config.layers.glass-dark.json');
  layersGlassDarkSD.buildAllPlatforms();

  console.log('Building layer configs for highcontrast themes...');
  const layersHighContrastSD = StyleDictionary.extend(__dirname + '/config.layers.highcontrast.json');
  layersHighContrastSD.buildAllPlatforms();

  const layersHighContrastDarkSD = StyleDictionary.extend(__dirname + '/config.layers.highcontrast-dark.json');
  layersHighContrastDarkSD.buildAllPlatforms();

  console.log('Building layer configs for redhat themes...');
  const layersRedhatSD = StyleDictionary.extend(__dirname + '/config.layers.redhat.json');
  layersRedhatSD.buildAllPlatforms();

  const layersRedhatDarkSD = StyleDictionary.extend(__dirname + '/config.layers.redhat-dark.json');
  layersRedhatDarkSD.buildAllPlatforms();

  const layersRedhatGlassSD = StyleDictionary.extend(__dirname + '/config.layers.redhat-glass.json');
  layersRedhatGlassSD.buildAllPlatforms();

  const layersRedhatGlassDarkSD = StyleDictionary.extend(__dirname + '/config.layers.redhat-glass-dark.json');
  layersRedhatGlassDarkSD.buildAllPlatforms();

  const layersRedhatHighContrastSD = StyleDictionary.extend(__dirname + '/config.layers.redhat-highcontrast.json');
  layersRedhatHighContrastSD.buildAllPlatforms();

  const layersRedhatHighContrastDarkSD = StyleDictionary.extend(__dirname + '/config.layers.redhat-highcontrast-dark.json');
  layersRedhatHighContrastDarkSD.buildAllPlatforms();

  // Step 3: Build glass themes
  console.log('Building glass themes...');
  const glassExtendedSD = StyleDictionary.extend(__dirname + '/config.glass.json');
  glassExtendedSD.buildAllPlatforms();

  const glassDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.glass.dark.json');
  glassDarkExtendedSD.buildAllPlatforms();

  // Step 4: Remove duplicate variables from glass SCSS files
  console.log('Removing duplicate variables from glass themes...');
  const buildPath = path.join(__dirname, 'build/css');
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-default.scss'),
    path.join(buildPath, 'tokens-glass.scss')
  );
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-dark.scss'),
    path.join(buildPath, 'tokens-glass-dark.scss')
  );

  // Step 5: Build redhat themes
  console.log('Building redhat themes...');
  const redhatExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat.json');
  redhatExtendedSD.buildAllPlatforms();

  const redhatDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat-dark.json');
  redhatDarkExtendedSD.buildAllPlatforms();

  const redhatGlassExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat-glass.json');
  redhatGlassExtendedSD.buildAllPlatforms();

  const redhatGlassDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat-glass-dark.json');
  redhatGlassDarkExtendedSD.buildAllPlatforms();

  const redhatHighContrastExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat-highcontrast.json');
  redhatHighContrastExtendedSD.buildAllPlatforms();

  const redhatHighContrastDarkExtendedSD = StyleDictionary.extend(__dirname + '/config.redhat-highcontrast-dark.json');
  redhatHighContrastDarkExtendedSD.buildAllPlatforms();

  // Step 6: Remove duplicate variables from redhat SCSS files
  console.log('Removing duplicate variables from redhat themes...');
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-default.scss'),
    path.join(buildPath, 'tokens-redhat.scss')
  );
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-dark.scss'),
    path.join(buildPath, 'tokens-redhat-dark.scss')
  );
  // Redhat glass themes compare against default (not glass), because they source all default/glass tokens
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-default.scss'),
    path.join(buildPath, 'tokens-redhat-glass.scss')
  );
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-dark.scss'),
    path.join(buildPath, 'tokens-redhat-glass-dark.scss')
  );
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-default.scss'),
    path.join(buildPath, 'tokens-redhat-highcontrast.scss')
  );
  removeDuplicateVariables(
    path.join(buildPath, 'tokens-dark.scss'),
    path.join(buildPath, 'tokens-redhat-highcontrast-dark.scss')
  );

  console.log('\n============================');
  console.log('\nBuild completed.');
};

/**
 * Remove CSS variable declarations from glassFile that are identical to baseFile
 * @param {string} baseFilePath - Path to base theme SCSS file (e.g., tokens-default.scss)
 * @param {string} glassFilePath - Path to glass theme SCSS file (e.g., tokens-glass.scss)
 */
function removeDuplicateVariables(baseFilePath, glassFilePath) {
  const baseContent = fs.readFileSync(baseFilePath, 'utf8');
  const glassContent = fs.readFileSync(glassFilePath, 'utf8');

  // Extract all CSS variable declarations from base file
  // Match lines like: --pf-t--global--border--radius--100: 4px;
  const varRegex = /^\s*(--[^:]+:\s*[^;]+;)\s*$/gm;

  const baseVars = new Set();
  let match;
  while ((match = varRegex.exec(baseContent)) !== null) {
    // Store the complete declaration (trimmed for comparison)
    baseVars.add(match[1].trim());
  }

  // Split glass file into lines
  const glassLines = glassContent.split('\n');
  const filteredLines = [];
  let removedCount = 0;

  // Filter out lines that exist in base
  for (const line of glassLines) {
    const varMatch = line.match(/^\s*(--[^:]+:\s*[^;]+;)\s*$/);

    if (varMatch && baseVars.has(varMatch[1].trim())) {
      // This line is identical to base, skip it
      removedCount++;
      continue;
    }

    // Keep this line (either not a var declaration or different from base)
    filteredLines.push(line);
  }

  // Reconstruct the file
  let newContent = filteredLines.join('\n');

  // Count remaining variables
  const remainingVars = filteredLines.filter(l => l.trim().startsWith('--')).length;

  // Update or add the comment to reflect actual diff count
  if (newContent.includes('// Only tokens that differ from base theme')) {
    newContent = newContent.replace(
      /\/\/ Only tokens that differ from base theme \(\d+ tokens\)/,
      `// Only tokens that differ from base theme (${remainingVars} tokens)`
    );
  } else {
    // Add the comment if it doesn't exist
    newContent = newContent.replace(
      /(@mixin pf-v6-tokens \{)/,
      `// Only tokens that differ from base theme (${remainingVars} tokens)\n$1`
    );
  }

  // Write back to glass file
  fs.writeFileSync(glassFilePath, newContent, 'utf8');

  console.log(`Removed ${removedCount} duplicate variables from ${path.basename(glassFilePath)}`);
}

module.exports = { build };
