---
section: foundations-and-styles
subsection: design-tokens
id: All design tokens
sortValue: 5
---

import * as defaultTokens from './token-layers-default.json';
import * as darkTokens from './token-layers-dark.json';
import * as glassTokens from './token-layers-glass.json';
import * as glassDarkTokens from './token-layers-glass-dark.json';
import * as highcontrastTokens from './token-layers-highcontrast.json';
import * as highcontrastDarkTokens from './token-layers-highcontrast-dark.json';
import * as redhatTokens from './token-layers-redhat.json';
import * as redhatDarkTokens from './token-layers-redhat-dark.json';
import * as redhatGlassTokens from './token-layers-redhat-glass.json';
import * as redhatGlassDarkTokens from './token-layers-redhat-glass-dark.json';
import * as redhatHighcontrastTokens from './token-layers-redhat-highcontrast.json';
import * as redhatHighcontrastDarkTokens from './token-layers-redhat-highcontrast-dark.json';
import { TokensTable } from './tokensTable.js';

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
}} />
