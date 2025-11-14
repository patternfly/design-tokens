import React from 'react';
import { AutoLinkHeader, Example, Link as PatternflyThemeLink } from '@patternfly/documentation-framework/components';
import * as defaultTokens from '../../../../content/./token-layers-default.json';
import * as darkTokens from '../../../../content/./token-layers-dark.json';
import { TokensTable } from '../../../../content/./tokensTable.js';
const pageData = {
  "id": "All design tokens",
  "section": "foundations-and-styles",
  "subsection": "design-tokens",
  "deprecated": false,
  "template": false,
  "beta": false,
  "demo": false,
  "newImplementationLink": false,
  "source": "design-tokens",
  "tabName": null,
  "slug": "/foundations-and-styles/design-tokens/all-design-tokens/design-tokens",
  "sourceLink": "https://github.com/patternfly/patternfly-org/blob/main/packages/module/patternfly-docs/content/all-patternfly-tokens.md",
  "relPath": "packages/module/patternfly-docs/content/all-patternfly-tokens.md"
};
pageData.liveContext = {
  defaultTokens,
  darkTokens,
  TokensTable
};
pageData.relativeImports = "import * as defaultTokens from 'content/./token-layers-default.json';,import * as darkTokens from 'content/./token-layers-dark.json';,import { TokensTable } from 'content/./tokensTable.js';"
pageData.examples = {
  
};

const Component = () => (
  <React.Fragment>
    <TokensTable tokenJson={{default: defaultTokens, dark: darkTokens}}/>
  </React.Fragment>
);
Component.displayName = 'FoundationsAndStylesDesignTokensAllDesignTokensDesignTokensDocs';
Component.pageData = pageData;

export default Component;
