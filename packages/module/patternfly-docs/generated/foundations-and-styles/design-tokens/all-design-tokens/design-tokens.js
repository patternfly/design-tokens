import React from 'react';
import { AutoLinkHeader, Example, Link as PatternflyThemeLink } from '@patternfly/documentation-framework/components';
import * as defaultTokens from '../../../../content/./token-layers-default.json';
import * as darkTokens from '../../../../content/./token-layers-dark.json';
import * as glassTokens from '../../../../content/./token-layers-glass.json';
import * as glassDarkTokens from '../../../../content/./token-layers-glass-dark.json';
import * as highcontrastTokens from '../../../../content/./token-layers-highcontrast.json';
import * as highcontrastDarkTokens from '../../../../content/./token-layers-highcontrast-dark.json';
import * as redhatTokens from '../../../../content/./token-layers-redhat.json';
import * as redhatDarkTokens from '../../../../content/./token-layers-redhat-dark.json';
import * as redhatGlassTokens from '../../../../content/./token-layers-redhat-glass.json';
import * as redhatGlassDarkTokens from '../../../../content/./token-layers-redhat-glass-dark.json';
import * as redhatHighcontrastTokens from '../../../../content/./token-layers-redhat-highcontrast.json';
import * as redhatHighcontrastDarkTokens from '../../../../content/./token-layers-redhat-highcontrast-dark.json';
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
  "relPath": "packages/module/patternfly-docs/content/all-patternfly-tokens.md",
  "sortValue": 5
};
pageData.liveContext = {
  defaultTokens,
  darkTokens,
  glassTokens,
  glassDarkTokens,
  highcontrastTokens,
  highcontrastDarkTokens,
  redhatTokens,
  redhatDarkTokens,
  redhatGlassTokens,
  redhatGlassDarkTokens,
  redhatHighcontrastTokens,
  redhatHighcontrastDarkTokens,
  TokensTable
};
pageData.relativeImports = "import * as defaultTokens from 'content/./token-layers-default.json';,import * as darkTokens from 'content/./token-layers-dark.json';,import * as glassTokens from 'content/./token-layers-glass.json';,import * as glassDarkTokens from 'content/./token-layers-glass-dark.json';,import * as highcontrastTokens from 'content/./token-layers-highcontrast.json';,import * as highcontrastDarkTokens from 'content/./token-layers-highcontrast-dark.json';,import * as redhatTokens from 'content/./token-layers-redhat.json';,import * as redhatDarkTokens from 'content/./token-layers-redhat-dark.json';,import * as redhatGlassTokens from 'content/./token-layers-redhat-glass.json';,import * as redhatGlassDarkTokens from 'content/./token-layers-redhat-glass-dark.json';,import * as redhatHighcontrastTokens from 'content/./token-layers-redhat-highcontrast.json';,import * as redhatHighcontrastDarkTokens from 'content/./token-layers-redhat-highcontrast-dark.json';,import { TokensTable } from 'content/./tokensTable.js';"
pageData.examples = {
  
};

const Component = () => (
  <React.Fragment>
    <TokensTable tokenJson={{
    default: defaultTokens,
    dark: darkTokens,
    glass: glassTokens,
    'glass-dark': glassDarkTokens,
    highcontrast: highcontrastTokens,
    'highcontrast-dark': highcontrastDarkTokens,
    redhat: redhatTokens,
    'redhat-dark': redhatDarkTokens,
    'redhat-glass': redhatGlassTokens,
    'redhat-glass-dark': redhatGlassDarkTokens,
    'redhat-highcontrast': redhatHighcontrastTokens,
    'redhat-highcontrast-dark': redhatHighcontrastDarkTokens
  }}/>
  </React.Fragment>
);
Component.displayName = 'FoundationsAndStylesDesignTokensAllDesignTokensDesignTokensDocs';
Component.pageData = pageData;

export default Component;
