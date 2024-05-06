const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const charts_scss = path.join(__dirname, 'build/css/tokens-charts.scss');
const charts_dark_scss = path.join(__dirname, 'build/css/tokens-charts-dark.scss');
const dark_scss = path.join(__dirname, 'build/css/tokens-dark.scss');
const default_scss = path.join(__dirname, 'build/css/tokens-default.scss');
const palette_scss = path.join(__dirname, 'build/css/tokens-palette.scss');

const chartFileContents = fs.readFileSync(charts_scss, 'utf-8');
const chartDarkFileContents = fs.readFileSync(charts_dark_scss, 'utf-8');
const darkFileContents = fs.readFileSync(dark_scss, 'utf-8');
const defaultFileContents = fs.readFileSync(default_scss, 'utf-8');
const paletteFileContents = fs.readFileSync(palette_scss, 'utf-8');

const scssAsJson = {}

const addToMap = (line) => {
  const trimmedLine = line.trimStart();
  if (trimmedLine.startsWith("--")) {
    const varName = trimmedLine.substring(0, trimmedLine.indexOf(':'));

    // value should have var( ) stripped from it, so it's just the variable name
    // if no var ( ) then just the value should be stored in the map
    let value = trimmedLine.substring(trimmedLine.indexOf(':')+1, trimmedLine.indexOf(';')).trimStart();
    if (value.startsWith('var(')) {
      value = value.substring(value.indexOf('(')+1, value.indexOf(')'));
    }
    scssAsJson[varName] = value
  }
}

paletteFileContents.split(/\r?\n/).forEach(line => addToMap(line));
defaultFileContents.split(/\r?\n/).forEach(line => addToMap(line));
darkFileContents.split(/\r?\n/).forEach(line => addToMap(line));
chartFileContents.split(/\r?\n/).forEach(line => addToMap(line));
chartDarkFileContents.split(/\r?\n/).forEach(line => addToMap(line));

fse.writeJson(path.join(__dirname, 'patternfly-docs/scssAsJson.json'), scssAsJson);

