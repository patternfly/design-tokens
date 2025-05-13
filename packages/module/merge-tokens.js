const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');
const glob = require('glob');

const SCHEMA_URL = 'https://schemas.design-tokens.org/standard/v1';

function mergeTokensForTheme(theme) {
  const tokenFiles = glob.sync(path.join(__dirname, `tokens/${theme}/*.json`));
  let mergedTokens = {};
  tokenFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    mergedTokens = merge(mergedTokens, content);
  });
  return mergedTokens;
}

function isToken(obj) {
  // A token is an object with a 'value' property (per your format)
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj) && Object.prototype.hasOwnProperty.call(obj, 'value');
}

function fixTokenFormat(obj) {
  if (isToken(obj)) {
    // Convert 'value', 'type', 'description' to $value, $type, $description
    return {
      $value: obj.value,
      $type: obj.type || 'unknown',
      $description: obj.description || ''
    };
  }
  // If primitive, wrap as token
  if (typeof obj !== 'object' || obj === null) {
    return {
      $type: 'unknown',
      $value: obj,
      $description: ''
    };
  }
  // Otherwise, it's a group: recurse into children
  const result = {};
  for (const key in obj) {
    result[key] = fixTokenFormat(obj[key]);
  }
  return result;
}

function buildW3CFormat(mergedTokens) {
  return {
    $schema: SCHEMA_URL,
    tokens: fixTokenFormat(mergedTokens)
  };
}

const mergedDefault = mergeTokensForTheme('default');
const mergedDark = mergeTokensForTheme('dark');

const outputDefault = path.join(__dirname, 'tokens/merged-default-tokens.json');
const outputDark = path.join(__dirname, 'tokens/merged-dark-tokens.json');

fs.writeFileSync(outputDefault, JSON.stringify(buildW3CFormat(mergedDefault), null, 2));
fs.writeFileSync(outputDark, JSON.stringify(buildW3CFormat(mergedDark), null, 2));

console.log(`Merged default tokens written to ${outputDefault}`);
console.log(`Merged dark tokens written to ${outputDark}`); 