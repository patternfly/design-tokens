const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');
const glob = require('glob');

function mergeTokensForTheme(theme) {
  const tokenFiles = glob.sync(path.join(__dirname, `tokens/${theme}/*.json`));
  let mergedTokens = {};
  tokenFiles.forEach(file => {
    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
    mergedTokens = merge(mergedTokens, content);
  });
  return mergedTokens;
}

const mergedDefault = mergeTokensForTheme('default');
const mergedDark = mergeTokensForTheme('dark');

const outputDefault = path.join(__dirname, 'tokens/merged-default-tokens.json');
const outputDark = path.join(__dirname, 'tokens/merged-dark-tokens.json');

fs.writeFileSync(outputDefault, JSON.stringify(mergedDefault, null, 2));
fs.writeFileSync(outputDark, JSON.stringify(mergedDark, null, 2));

console.log(`Merged default tokens written to ${outputDefault}`);
console.log(`Merged dark tokens written to ${outputDark}`); 