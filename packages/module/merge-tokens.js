const fs = require('fs');
const path = require('path');
const { merge } = require('lodash');

const glob = require('glob');

// Find all JSON token files in default and dark themes
const tokenFiles = [
  ...glob.sync(path.join(__dirname, 'tokens/default/*.json')),
  ...glob.sync(path.join(__dirname, 'tokens/dark/*.json')),
];

let mergedTokens = {};

tokenFiles.forEach(file => {
  const content = JSON.parse(fs.readFileSync(file, 'utf8'));
  mergedTokens = merge(mergedTokens, content);
});

const outputPath = path.join(__dirname, 'tokens/merged-tokens.json');
fs.writeFileSync(outputPath, JSON.stringify(mergedTokens, null, 2));

console.log(`Merged tokens written to ${outputPath}`); 