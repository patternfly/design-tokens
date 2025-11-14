---
section: foundations-and-styles
subsection: design-tokens
id: All design tokens
---

import * as defaultTokens from './token-layers-default.json';
import * as darkTokens from './token-layers-dark.json';
import { TokensTable } from './tokensTable.js';

<TokensTable tokenJson={{default: defaultTokens, dark: darkTokens}} />
