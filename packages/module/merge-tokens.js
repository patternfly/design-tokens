const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');
const glob = require('glob');

const TOKENS_DIR_NAME = 'tokens';
const OUTPUT_FILE_PATH = path.join(__dirname, 'build', 'json', 'tokens-w3c.json');

// Check if an object is a legacy token with a 'value' property
function isLegacyValueObject(obj) {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && Object.hasOwn(obj, 'value');
}

// Check if a value is a reference string like "{path.to.token}"
function isReferenceValue(val) {
  return typeof val === 'string' && val.startsWith('{') && val.endsWith('}');
}

// Removes "global." and/or "dark." prefixes from reference strings
function stripReferencePrefix(valueString) {
  if (!isReferenceValue(valueString)) {
    return valueString;
  }
  // Handles {global.foo}, {dark.foo}, {global.dark.foo}
  return valueString.replace(/^(\{[\s]?)(?:global\.dark\.|global\.|dark\.)(.*?\s*\})$/, '$1$2');
}

// --- DTCG Type Mapping Rules ---
// Map legacy token paths/structures to W3C DTCG types
// Order matters: first match determines the type
const DTCG_RULES = [
  // === High-Priority (needs to be in the right order) ===
  {
    type: 'dimension',
    match: (tokenPath) => /^breakpoint\b/i.test(tokenPath) || /^layout\.(height|width)\b/i.test(tokenPath),
  },

  // === Supported exists in Penpot ===
  {
    type: 'borderRadius',
    match: (tokenPath) => /\bborder-radius\b/i.test(tokenPath) || /\bborder\.radius\b/i.test(tokenPath),
  }, {
    type: 'color',
    match: (tokenPath, tokenValue) => {
      const val = isLegacyValueObject(tokenValue) ? tokenValue.value : tokenValue;
      return typeof val === 'string' && (/^#(?:[0-9a-fA-F]{3,8})$/.test(val) || /^(rgba?|hsla?)\(/.test(val));
    },
  }, {
    type: 'opacity',
    match: (tokenPath) => /\bopacity\b/i.test(tokenPath)
  }, {
    type: 'rotation', // Added for clarity, can be unitless or deg/turn
    match: (tokenPath) => /\b(rotation|angle)\b/i.test(tokenPath)
  }, {
    type: 'sizing',
    match: (tokenPath) => (/\bicon\.size\b/i.test(tokenPath) && !/\bfont\b/i.test(tokenPath)) || /\bsizing\b/i.test(tokenPath)
  }, {
    type: 'spacing',
    match: (tokenPath) => /\b(spacer|gap|inset|gutter|padding|margin|spacing)\b/i.test(tokenPath) && !/\bfont\b/i.test(tokenPath) && !/\bletter-spacing\b/i.test(tokenPath)
  }, {
    type: 'strokeWidth', // Catches border-width, border.width, stroke-width etc.
    match: (tokenPath) => /\b(border-width|border\.width|borderwidth|stroke-width|stroke\.width)\b/i.test(tokenPath)
  }, {
    type: 'dimension', // Generic dimension rule (simplified)
    match: (tokenPath) => {
      return (/\b(width|height|size|radius)\b/i.test(tokenPath) || /\bdimension\b/i.test(tokenPath)) &&
        !/\b(font|text-decoration)\b/i.test(tokenPath)
    },
  },

  // === Theoretical, probably supported in Penpot in the future ===
  {
    type: 'delay',
    match: (tokenPath) => /\bdelay\b/i.test(tokenPath)
  }, {
    type: 'duration',
    match: (tokenPath) => /\bduration\b/i.test(tokenPath)
  }, {
    type: 'fontFamily',
    match: (tokenPath) => /\bfont\.family\b/i.test(tokenPath)
  }, {
    type: 'fontSize',
    match: (tokenPath) => /\bfont-size\b/i.test(tokenPath) || /font\.size\b/i.test(tokenPath)
  }, {
    type: 'fontWeight',
    match: (tokenPath) => /\bfont-weight\b/i.test(tokenPath) || /font\.weight\b/i.test(tokenPath)
  }, {
    type: 'letterSpacing',
    match: (tokenPath) => /\bletter-spacing\b/i.test(tokenPath)
  }, {
    type: 'lineHeight',
    match: (tokenPath) => /\bline-height\b/i.test(tokenPath)
  }, {
    type: 'zIndex',
    match: (tokenPath) => /z-index\b/i.test(tokenPath)
  },
];

// Sniff out actual W3C token type
function determineW3CType(tokenPath, tokenValue, originalLegacyType) {
  for (const rule of DTCG_RULES) {
    if (rule.match(tokenPath.toLowerCase(), tokenValue, originalLegacyType)) {
      return rule.type;
    }
  }

  // If a rule doesn't match, just do a passthrough
  return originalLegacyType;
}

// Processes an original token value into a W3C-compliant $value
function processW3CValue(originalValue, w3cType, tokenPath) {
  let processedValue = originalValue;

  if (isReferenceValue(processedValue)) {
    return stripReferencePrefix(processedValue);
  }

  // Handle time-based types: duration, delay
  if (w3cType === 'duration' || w3cType === 'delay') {
    if (typeof processedValue === 'string') {
      const trimmedVal = processedValue.trim();
      const num = parseFloat(trimmedVal);
      if (!isNaN(num)) { // Check if the string starts with a number
        if (trimmedVal.toLowerCase().endsWith('s') && !trimmedVal.toLowerCase().endsWith('ms')) {
          processedValue = (num * 1000) + 'ms';
        } else if (!trimmedVal.toLowerCase().endsWith('ms')) { // Unitless number string
          processedValue = num + 'ms';
        } else {
            // Already in 'ms' or other recognized format
            processedValue = trimmedVal;
        }
      }
    } else if (typeof processedValue === 'number') {
      processedValue = String(processedValue) + 'ms';
    }
  }

  return processedValue;
}

// Recursively transforms legacy tokens to W3C DTCG
function transformTokensToW3C(legacyData, currentPathSegments = []) {
  const w3cNode = {};
  for (const key in legacyData) {
    if (!Object.hasOwn(legacyData, key)) continue;

    const currentLegacyItem = legacyData[key];
    const newPathSegments = [...currentPathSegments, key];
    const tokenPath = newPathSegments.join('.');

    // Check if current item is a group (object, not null, not array, and not a legacy token object)
    if (typeof currentLegacyItem === 'object' && currentLegacyItem !== null && !Array.isArray(currentLegacyItem) && !isLegacyValueObject(currentLegacyItem)) {
      w3cNode[key] = transformTokensToW3C(currentLegacyItem, newPathSegments);
    } else {
      // It's a leaf node (a token) or a legacy value object
      const originalValue = isLegacyValueObject(currentLegacyItem) ? currentLegacyItem.value : currentLegacyItem;
      const originalDescription = isLegacyValueObject(currentLegacyItem) ? currentLegacyItem.description : null;
      const originalLegacyType = isLegacyValueObject(currentLegacyItem) ? currentLegacyItem.type : null;

      const w3cType = determineW3CType(tokenPath, originalValue, originalLegacyType);
      const w3cValue = processW3CValue(originalValue, w3cType, tokenPath);

      w3cNode[key] = {
        $value: w3cValue,
        $type: w3cType,
      };

      if (originalDescription != null) {
        w3cNode[key].$description = originalDescription;
      }
    }
  }
  return w3cNode;
}

// Loads and merges JSON token files
function loadSourceTokens(filesOrPatterns, rootTokensDir) {
  let mergedTokens = {};
  const filesToProcess = new Set();
  const absoluteRootTokensDir = path.join(__dirname, rootTokensDir);

  if (!Array.isArray(filesOrPatterns)) {
    filesOrPatterns = [filesOrPatterns];
  }

  filesOrPatterns.forEach(item => {
    const pathWithinRoot = item; // item is relative to rootTokensDir for glob
    if (typeof item === 'string' && item.includes('*')) { // Glob pattern
      const foundFiles = glob.sync(item, { cwd: absoluteRootTokensDir, dot: true, absolute: false });
      foundFiles.forEach(f => filesToProcess.add(path.join(rootTokensDir, f))); // Store as project-relative path
    } else if (typeof item === 'string') { // Single file path
      filesToProcess.add(path.join(rootTokensDir, pathWithinRoot)); // Store as project-relative path
    }
  });

  filesToProcess.forEach(projectRelativePath => {
    const absoluteFilePath = path.join(__dirname, projectRelativePath);
    const fileContent = fs.readFileSync(absoluteFilePath, 'utf8');
    let content = JSON.parse(fileContent);
    // Handle common case where tokens might be nested under a single top-level key like "global"
    const keys = Object.keys(content);
    if (keys.length === 1 && keys[0]?.toLowerCase() === 'global') {
      content = content[keys[0]];
    }
    mergedTokens = merge(mergedTokens, content); // lodash.merge for deep merging
  });
  return mergedTokens;
}

// Checks if a W3C token object is semantic (a reference)
function isSemanticToken(w3cToken) {
  return w3cToken?.$value && typeof w3cToken.$value === 'string' && isReferenceValue(w3cToken.$value);
}

// Recursively filter a W3C token tree
function filterNodes(tree, { leafTest, groupTest }) {
  const result = {};
  for (const key in tree) {
    if (!Object.hasOwn(tree, key)) continue;
    const node = tree[key];

    if (node?.$value !== undefined) {
      // It's a leaf?
      if (!leafTest || leafTest(node)) {
        result[key] = structuredClone(node);
      }
    } else if (typeof node === 'object' && node !== null && !Array.isArray(node)) {
      // It's a group?
      const shouldProcessGroup = !groupTest || groupTest(key, node);
      if (shouldProcessGroup) {
        const filteredChildren = filterNodes(node, { leafTest, groupTest });
        if (Object.keys(filteredChildren).length > 0) {
          result[key] = filteredChildren;
        }
      }
    }
  }

  return result;
}


function main() {
  const tokenSourceConfigs = [
    {
      name: 'rawBaseAndSemantic',
      patterns: glob.sync('default/**/*.json', { cwd: path.join(__dirname, TOKENS_DIR_NAME), dot: true }).filter(f => !/charts\.json$/i.test(f) && !f.includes('.dark.')),
    }, {
      name: 'rawDarkOverrides',
      patterns: ['dark/base.dark.json', 'dark/semantic.dark.json'],
      flattenKey: 'dark'
    }, {
      name: 'rawChartBase',
      patterns: ['default/charts.json'],
    }, {
      name: 'rawChartDarkOverrides',
      patterns: ['dark/charts.dark.json'],
    }
  ];

  const rawTokenData = {};
  tokenSourceConfigs.forEach(config => {
    let loadedData = loadSourceTokens(config.patterns, TOKENS_DIR_NAME);
    if (config.flattenKey && loadedData?.[config.flattenKey] && typeof loadedData[config.flattenKey] === 'object') {
      const subObjectContent = loadedData[config.flattenKey];
      delete loadedData[config.flattenKey]; // Remove the key itself
      loadedData = merge(loadedData, subObjectContent); // Merge its content into the parent
    }
    rawTokenData[config.name] = loadedData;
  });

  const transformedTokenData = {};

  for (const key in rawTokenData) {
    if (Object.hasOwn(rawTokenData, key)) {
      transformedTokenData[key.replace('raw', 'transformed')] = transformTokensToW3C(rawTokenData[key]);
    }
  }

  // Filter out groups (used for chart)
  const chartGroupExclusionTest = (groupKey, groupNode) => {
    return !(groupKey.toLowerCase() === 'chart' && groupNode?.$value === undefined);
  };

  transformedTokenData.transformedBaseAndSemantic = filterNodes(
    transformedTokenData.transformedBaseAndSemantic,
    { groupTest: chartGroupExclusionTest }
  );

  transformedTokenData.transformedDarkOverrides = filterNodes(
    transformedTokenData.transformedDarkOverrides,
    { groupTest: chartGroupExclusionTest }
  );

  // Filter tokens into definition (non-semantic) and semantic sets
  const definitionSet = filterNodes(
    transformedTokenData.transformedBaseAndSemantic,
    { leafTest: token => !isSemanticToken(token) }
  );
  const semanticSet = filterNodes(
    transformedTokenData.transformedBaseAndSemantic,
    { leafTest: token => isSemanticToken(token) }
  );

  const tokenSetCollection = {
    "Definition": definitionSet ?? {},
    "Semantic": semanticSet ?? {},
    "Dark": transformedTokenData.transformedDarkOverrides ?? {},
    "Chart": transformedTokenData.transformedChartBase ?? {},
    "Chart-Dark": transformedTokenData.transformedChartDarkOverrides ?? {}
  };

  const themeConfigs = [
    { name: "Default", selectedSetNames: ["Definition", "Semantic", "Chart"] },
    { name: "Dark",    selectedSetNames: ["Definition", "Semantic", "Dark", "Chart", "Chart-Dark"] }
  ];

  const themesArray = themeConfigs.map(themeConfig => {
    const selectedTokenSets = {};
    let themeHasContent = false;

    themeConfig.selectedSetNames.forEach(setName => {
      if (tokenSetCollection[setName] && Object.keys(tokenSetCollection[setName]).length > 0) {
        selectedTokenSets[setName] = "enabled";
        themeHasContent = true;
      } else if (setName === "Definition" || setName === "Semantic") {
        selectedTokenSets[setName] = "enabled";
        themeHasContent = true;
      }
    });

    if (themeHasContent) {
      return {
        id: `theme-${themeConfig.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: themeConfig.name,
        selectedTokenSets,
        description: `${themeConfig.name} theme configuration`,
      };
    }
    return null;
  }).filter(Boolean);

  const w3cTokenDocument = { ...tokenSetCollection };

  if (themesArray.length > 0) {
    w3cTokenDocument["$themes"] = themesArray;
  }

  w3cTokenDocument["$metadata"] = { "tokenSetOrder": Object.keys(tokenSetCollection) };

  // Create directory (if needed) and write the output file
  const outputDir = path.dirname(OUTPUT_FILE_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(w3cTokenDocument, null, 2));
  console.log(`Generated W3C tokens: ${path.resolve(OUTPUT_FILE_PATH)}`);
}

main();
