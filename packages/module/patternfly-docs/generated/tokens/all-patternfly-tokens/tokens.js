import React from 'react';
import { AutoLinkHeader, Example, Link as PatternflyThemeLink } from '@patternfly/documentation-framework/components';
import * as defaultTokens from '../../../content/./semantic-tokens-default.json';
import * as darkTokens from '../../../content/./semantic-tokens-dark.json';
import { TokensTable } from '../../../content/./tokensTable.js';
import { TokensTableCategories } from '../../../content/./tokensTableCategories.js';
const pageData = {
  "id": "All PatternFly tokens",
  "section": "tokens",
  "subsection": "",
  "deprecated": false,
  "beta": false,
  "demo": false,
  "newImplementationLink": false,
  "source": "tokens",
  "tabName": null,
  "slug": "/tokens/all-patternfly-tokens/tokens",
  "sourceLink": "https://github.com/patternfly/patternfly-org/blob/main/packages/module/patternfly-docs/content/all-patternfly-tokens.md",
  "relPath": "packages/module/patternfly-docs/content/all-patternfly-tokens.md"
};
pageData.liveContext = {
  defaultTokens,
  darkTokens,
  TokensTable,
  TokensTableCategories
};
pageData.relativeImports = "import * as defaultTokens from 'content/./semantic-tokens-default.json';,import * as darkTokens from 'content/./semantic-tokens-dark.json';,import { TokensTable } from 'content/./tokensTable.js';,import { TokensTableCategories } from 'content/./tokensTableCategories.js';"
pageData.examples = {
  
};

const Component = () => (
  <React.Fragment>
    <TokensTableCategories tokenJson={{default: defaultTokens, dark: darkTokens}}/>
  </React.Fragment>
);
Component.displayName = 'TokensAllPatternflyTokensTokensDocs';
Component.pageData = pageData;

export default Component;
