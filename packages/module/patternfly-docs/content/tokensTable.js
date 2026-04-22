import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Flex,
  FlexItem,
  Pagination,
  Popover,
  Title,
  Tooltip,
  capitalize
} from '@patternfly/react-core';
import {
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  OuterScrollContainer,
  InnerScrollContainer
} from '@patternfly/react-table';
import {
  TokensToolbar,
  ThemeDisplayLabel,
  ThemeLabelAbbrevContext,
  ThemeAbbrevLegend
} from './tokensToolbar';
import './tokensTable.css';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';
import c_expandable_section_m_display_lg_PaddingInlineStart from '@patternfly/react-tokens/dist/esm/c_expandable_section_m_display_lg_PaddingInlineStart';
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

{
  /* Helper functions */
}

/** At or below this viewport width, theme labels switch to abbreviations (DT | Lt | DC, …). */
const THEME_LABEL_ABBREV_MEDIA = '(max-width: 1600px)';

function useAbbreviateThemesByViewport() {
  const [abbreviate, setAbbreviate] = React.useState(() =>
    typeof window !== 'undefined' && window.matchMedia(THEME_LABEL_ABBREV_MEDIA).matches
  );

  React.useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const mq = window.matchMedia(THEME_LABEL_ABBREV_MEDIA);
    const sync = () => setAbbreviate(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return abbreviate;
}

const getTokensFromJson = (tokenJson) => {
  if (!tokenJson || typeof tokenJson !== 'object') {
    return {};
  }

  const themesArr = Object.keys(tokenJson);
  const allTokens = {};

  const mergeThemeData = (themeName, source, target) => {
    if (!source || typeof source !== 'object') {
      return;
    }

    Object.entries(source).forEach(([key, value]) => {
      // Check for theme-specific value objects (e.g., { default: ... } or { dark: ... })
      const hasThemeKey =
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (Object.hasOwn(value, 'default') || Object.hasOwn(value, 'dark')) &&
        Object.keys(value).length === 1;

      if (hasThemeKey) {
        const themeValue = value.default ?? value.dark;
        target[key] = target[key] || {};
        target[key][themeName] = themeValue;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        target[key] = target[key] || {};
        mergeThemeData(themeName, value, target[key]);
      } else {
        target[key] = target[key] || {};
        target[key][themeName] = value;
      }
    });
  };

  themesArr.forEach((themeName) => {
    // Read-only merge into a fresh tree; no deep clone — theme JSON modules are treated as immutable.
    mergeThemeData(themeName, tokenJson[themeName], allTokens);
  });

  return allTokens;
};

const isSearchMatch = (searchValue, tokenName, tokenData) => {
  // match all tokens if no search term
  if (searchValue === '') {
    return true;
  }

  if (!tokenData || typeof tokenData !== 'object') {
    return false;
  }

  // match search term to token name, value, and description
  searchValue = searchValue.toLowerCase();
  return (
    tokenName.toLowerCase().includes(searchValue) ||
    Object.entries(tokenData).some(([_themeName, themeData]) => {
      if (!themeData || typeof themeData !== 'object') {
        return false;
      }

      // Check if value matches (convert to string first)
      const valueMatch =
        themeData.value !== undefined &&
        themeData.value !== null &&
        String(themeData.value).toLowerCase().includes(searchValue);

      // Check if description matches (only if it's a string)
      const descriptionMatch =
        typeof themeData.description === 'string' &&
        themeData.description.toLowerCase().includes(searchValue);

      return valueMatch || descriptionMatch;
    })
  );
};

const getFilteredTokens = (tokensArr, searchVal) =>
  tokensArr.filter(([tokenName, tokenData]) => isSearchMatch(searchVal, tokenName, tokenData));

/**
 * Build reverse reference map: which tokens use each base/palette token
 * @returns {Object} - { tokenName: [{ category, tokenName }, ...] }
 */
const buildReferenceMap = (mergedTokens) => {
  const referenceMap = {};

  const searchTokens = (tokens, categoryName) => {
    Object.entries(tokens).forEach(([key, value]) => {
      if (!value || typeof value !== 'object') {
        return;
      }

      // Check if this is a token with theme data
      const hasThemeData = Object.values(value).some(
        v => v && typeof v === 'object' && (v.references || v.value)
      );

      if (hasThemeData) {
        // This is a token - check its references
        Object.values(value).forEach(themeData => {
          if (themeData?.references) {
            themeData.references.forEach(ref => {
              if (ref.name) {
                if (!referenceMap[ref.name]) {
                  referenceMap[ref.name] = [];
                }
                // Use just the token name (key), not the full path
                // Avoid duplicates
                if (!referenceMap[ref.name].some(r => r.category === categoryName && r.tokenName === key)) {
                  referenceMap[ref.name].push({
                    category: categoryName,
                    tokenName: key
                  });
                }
              }
            });
          }
        });
      } else {
        // Recurse into nested structure
        searchTokens(value, categoryName);
      }
    });
  };

  // Search semantic, chart, and base categories for references
  ['semantic', 'chart', 'base'].forEach(category => {
    if (mergedTokens[category]) {
      searchTokens(mergedTokens[category], category);
    }
  });

  return referenceMap;
};

/**
 * Search across all categories and return results grouped by category
 * @returns {Object} - { categoryName: [...tokens], ... } with only categories that have matches
 */
const getFilteredTokensByCategory = (mergedTokens, allCategoriesArr, searchVal) => {
  if (!searchVal || searchVal.trim() === '') {
    return {};
  }

  const resultsByCategory = {};

  allCategoriesArr.forEach((category) => {
    const categoryTokens = mergedTokens[category];
    if (!categoryTokens) {
      return;
    }

    const categoryTokensArr = getCategoryTokensArr(category, categoryTokens);
    const matches = getFilteredTokens(categoryTokensArr, searchVal);

    if (matches.length > 0) {
      resultsByCategory[category] = matches;
    }
  });

  return resultsByCategory;
};

const getIsColor = (value) => {
  // Extract the actual value if it's nested in an object
  const actualValue = (value && typeof value === 'object' && value.default) ? value.default : value;
  return /^(#|rgb)/.test(actualValue);
};


const getCategoryTokensArr = (selectedCategory, categoryTokens) => {
  if (!categoryTokens || typeof categoryTokens !== 'object') {
    return [];
  }

  // Create array of all tokens/nested tokens in selectedCategory
  let categoryTokensArr = [];
  const NESTED_CATEGORIES = ['base', 'semantic'];

  if (!NESTED_CATEGORIES.includes(selectedCategory)) {
    categoryTokensArr = Object.entries(categoryTokens);
  } else {
    // base/semantic combine nested subcategory tokens into flattened arr
    for (const subCategory in categoryTokens) {
      if (Object.hasOwn(categoryTokens, subCategory)) {
        const subCategoryTokens = categoryTokens[subCategory];
        if (subCategoryTokens && typeof subCategoryTokens === 'object') {
          categoryTokensArr.push(...Object.entries(subCategoryTokens));
        }
      }
    }
  }
  return categoryTokensArr;
};

/**
 * Theme select order and "All themes" value rows: Default family (Light: DC, HC, Gl; then Dark: …),
 * then Unified family the same. Matches ThemeDisplayLabel column semantics.
 */
const THEME_OPTION_ORDER = [
  'default',
  'highcontrast',
  'glass',
  'dark',
  'highcontrast-dark',
  'glass-dark',
  'redhat',
  'redhat-highcontrast',
  'redhat-glass',
  'redhat-dark',
  'redhat-highcontrast-dark',
  'redhat-glass-dark'
];

const THEME_OPTION_ORDER_INDEX = Object.fromEntries(THEME_OPTION_ORDER.map((name, index) => [name, index]));

const compareThemeNames = (a, b) => {
  const ai = THEME_OPTION_ORDER_INDEX[a];
  const bi = THEME_OPTION_ORDER_INDEX[b];
  const aKnown = ai !== undefined;
  const bKnown = bi !== undefined;
  if (!aKnown && !bKnown) {
    return a.localeCompare(b);
  }
  if (!aKnown) {
    return 1;
  }
  if (!bKnown) {
    return -1;
  }
  return ai - bi;
};

const getThemeEntriesForDisplay = (tokenData, selectedTheme, exhibitsThemeVariantValues, allAvailableThemes) => {
  if (!tokenData || typeof tokenData !== 'object') {
    return [];
  }

  const normalizeThemeValue = (themeValue) => {
    if (!themeValue) {
      return themeValue;
    }
    // If it has a default property, use that (for some token structures)
    if (Object.hasOwn(themeValue, 'default')) {
      return themeValue.default;
    }
    // If it's an object with a value property, extract the value
    if (typeof themeValue === 'object' && Object.hasOwn(themeValue, 'value')) {
      return themeValue;
    }
    // Otherwise return as-is
    return themeValue;
  };

  if (selectedTheme === 'all') {
    if (!exhibitsThemeVariantValues) {
      // For palette tokens, show only one value since they don't vary by theme
      const firstTheme = Object.keys(tokenData)[0];
      if (!firstTheme) {
        return [];
      }
      return [[firstTheme, normalizeThemeValue(tokenData[firstTheme])]];
    }

    // Group themes by their value (don't sort first - group all matching values together)
    const valueGroups = new Map();
    const themesWithoutValue = [];

    // Check ALL available themes, not just the ones in tokenData
    const themesToCheck = allAvailableThemes || Object.keys(tokenData);

    themesToCheck.forEach((themeName) => {
      const themeValue = tokenData[themeName];
      const normalizedValue = normalizeThemeValue(themeValue);

      // Track themes that don't have a value
      if (!normalizedValue || normalizedValue.value === undefined) {
        themesWithoutValue.push(themeName);
        return;
      }

      // Create a key from the value for grouping - sort references to ensure consistent key
      const valueKey = JSON.stringify({
        value: normalizedValue?.value,
        references: normalizedValue?.references?.map(r => r.name).sort()
      });

      if (!valueGroups.has(valueKey)) {
        valueGroups.set(valueKey, {
          themeNames: [],
          themeValue: normalizedValue
        });
      }
      valueGroups.get(valueKey).themeNames.push(themeName);
    });

    // Build result with theme names sorted within each group
    const result = Array.from(valueGroups.values()).map(({ themeNames, themeValue }) => [
      themeNames.sort(compareThemeNames),
      themeValue
    ]);

    // Add group for themes without values if any exist
    if (themesWithoutValue.length > 0) {
      result.push([themesWithoutValue.sort(compareThemeNames), null]);
    }

    return result;
  }

  const themeValue = tokenData[selectedTheme];

  // If theme doesn't exist for this token, return null to indicate no value
  if (!themeValue) {
    return [[selectedTheme, null]];
  }

  const tokenValue = normalizeThemeValue(themeValue) || {
    value: '',
    description: tokenData[Object.keys(tokenData)[0]]?.description || '',
    references: []
  };
  return [[selectedTheme, tokenValue]];
};

const getTokenChain = (themeTokenData) => {
  if (!themeTokenData || typeof themeTokenData !== 'object') {
    return [];
  }

  const tokenChain = [];
  const MAX_CHAIN_DEPTH = 50; // Prevent infinite loops
  let depth = 0;

  if (!themeTokenData.references?.[0]) {
    const value = themeTokenData.value;
    if (value !== undefined && value !== null) {
      tokenChain.push(value);
    }
    return tokenChain;
  }

  let referenceToken = themeTokenData.references[0];
  while (referenceToken && depth < MAX_CHAIN_DEPTH) {
    depth++;

    if (referenceToken.name) {
      tokenChain.push(referenceToken.name);
    }

    if (referenceToken.references?.[0]) {
      referenceToken = referenceToken.references[0];
    } else {
      if (referenceToken.value !== undefined && referenceToken.value !== null) {
        tokenChain.push(referenceToken.value);
      }
      break;
    }
  }

  return tokenChain;
};

const findTokenCategory = (tokenName, mergedTokens) => {
  // Search through categories to find which one contains this token
  for (const category of ['semantic', 'chart', 'base', 'palette']) {
    if (!mergedTokens[category]) continue;

    const searchInCategory = (tokens) => {
      for (const [key, value] of Object.entries(tokens)) {
        if (key === tokenName) {
          return true;
        }
        // Check if it's a nested structure
        if (value && typeof value === 'object') {
          const hasThemeData = Object.values(value).some(
            v => v && typeof v === 'object' && (v.references || v.value)
          );
          if (!hasThemeData && searchInCategory(value)) {
            return true;
          }
        }
      }
      return false;
    };

    if (searchInCategory(mergedTokens[category])) {
      return category;
    }
  }
  return null;
};

const showTokenChain = (themeTokenData, hasReferences, onNavigate, mergedTokens) => {
  const tokenChain = hasReferences ? getTokenChain(themeTokenData) : [themeTokenData.value];

  return (
    <div>
      {tokenChain.map((nextValue, index) => {
        // Check if this value is a token name (starts with pf-t--)
        const isTokenReference = typeof nextValue === 'string' && nextValue.startsWith('pf-t--');
        const category = isTokenReference && mergedTokens ? findTokenCategory(nextValue, mergedTokens) : null;

        return (
          <div
            key={`${index}`}
            className="ws-token-chain-item"
            style={{
              padding: `4px 0 4px calc(${c_expandable_section_m_display_lg_PaddingInlineStart.value} * ${index})`
            }}
          >
            <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
            <span
              className="ws-token-chain-value"
              style={{ paddingInlineStart: c_expandable_section_m_display_lg_PaddingInlineStart.value }}
            >
              {isTokenReference && category && onNavigate ? (
                <Button
                  variant="link"
                  isInline
                  onClick={() => onNavigate(category, nextValue)}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    padding: 0,
                    verticalAlign: 'baseline'
                  }}
                >
                  [{capitalize(category)}] {nextValue}
                </Button>
              ) : (
                nextValue
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

{
  /* Components */
}
const TokenDerivationPopoverBody = ({ themeName, themeToken, showThemeLabel, exhibitsThemeVariantValues, onNavigate, mergedTokens }) => {
  const hasReferences = Boolean(themeToken?.references?.[0]);
  const themeNames = Array.isArray(themeName) ? themeName : [themeName];
  const isGrouped = themeNames.length > 1;

  return (
    <ThemeLabelAbbrevContext.Provider value={false}>
      <div className="ws-token-derivation-popover">
        {exhibitsThemeVariantValues && showThemeLabel && (
          <div className="ws-token-derivation-popover__theme">
            {isGrouped ? (
              <div>
                <strong>{themeNames.length} themes:</strong>
                <div style={{ marginBlockStart: 'var(--pf-t--global--spacer--xs)' }}>
                  {themeNames.map((name) => (
                    <div key={name}>
                      <ThemeDisplayLabel themeName={name} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ThemeDisplayLabel themeName={themeNames[0]} />
            )}
          </div>
        )}
        {showTokenChain(themeToken, hasReferences, onNavigate, mergedTokens)}
      </div>
    </ThemeLabelAbbrevContext.Provider>
  );
};

const TokenValue = ({
  themeName,
  themeToken,
  tokenName,
  showThemeLabel,
  showDerivationPopover,
  exhibitsThemeVariantValues,
  onNavigate,
  mergedTokens
}) => {
  // Handle null themeToken (theme doesn't exist for this token)
  if (themeToken === null) {
    const themeNames = Array.isArray(themeName) ? themeName : [themeName];
    const themeKey = themeNames.join('-');
    const isGrouped = themeNames.length > 1;

    return (
      <div className="ws-token-value-line" key={`${themeKey}-${tokenName}`}>
        <ThemeLabelAbbrevContext.Provider value={true}>
          <Flex
            className="ws-token-value-line-inner"
            direction={{ default: 'row' }}
            alignItems={{ default: 'alignItemsCenter' }}
            flexWrap={{ default: 'nowrap' }}
            spaceItems={{ default: 'spaceItemsSm' }}
          >
            {showThemeLabel && (
              <FlexItem className="ws-theme-label-inline">
                {isGrouped ? (
                  <Tooltip
                    content={
                      <ThemeLabelAbbrevContext.Provider value={false}>
                        <div>
                          {themeNames.map((name) => (
                            <div key={name}>
                              <ThemeDisplayLabel themeName={name} />
                            </div>
                          ))}
                        </div>
                      </ThemeLabelAbbrevContext.Provider>
                    }
                    position="top"
                  >
                    <span className="ws-theme-group-label" tabIndex={0}>
                      {themeNames.length} themes
                    </span>
                  </Tooltip>
                ) : (
                  <ThemeDisplayLabel themeName={themeNames[0]} />
                )}
              </FlexItem>
            )}
            <FlexItem className="ws-token-value-main">
              <span style={{ color: 'var(--pf-t--global--text--color--subtle)' }}>—</span>
            </FlexItem>
          </Flex>
        </ThemeLabelAbbrevContext.Provider>
      </div>
    );
  }

  if (!themeToken || typeof themeToken !== 'object') {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`TokenValue: Invalid themeToken for ${tokenName}`);
    }
    return null;
  }

  // Extract the actual value from token.value if it's nested in an object
  let displayValue = themeToken.value;

  if (displayValue && typeof displayValue === 'object' && !Array.isArray(displayValue)) {
    // If value is an object, try to extract a string value
    const values = Object.values(displayValue);
    if (values.length > 0 && typeof values[0] === 'string') {
      displayValue = values[0];
    } else {
      // Cannot extract a valid string value
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Unable to extract displayValue for token ${tokenName}:`, displayValue);
      }
      return null;
    }
  }

  // Ensure displayValue is a primitive type suitable for rendering
  if (typeof displayValue === 'object' || displayValue === undefined || displayValue === null) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`DisplayValue is invalid for ${tokenName}:`, typeof displayValue);
    }
    return null;
  }

  // Convert to string if needed
  displayValue = String(displayValue);

  const isColor = getIsColor(themeToken.value);
  const valueMain = isColor ? (
    <Flex
      direction={{ default: 'row' }}
      alignItems={{ default: 'alignItemsCenter' }}
      flexWrap={{ default: 'nowrap' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem className="ws-token-value-hex-wrap">
        <span className="ws-token-value-hex">{displayValue}</span>
      </FlexItem>
      <FlexItem className="ws-token-swatch-wrap">
        <span className="ws-token-swatch" style={{ backgroundColor: displayValue }} />
      </FlexItem>
    </Flex>
  ) : (
    <span className="ws-token-value-plain-inline">{displayValue}</span>
  );

  const valueFlexItem = (
    <FlexItem
      className={
        showThemeLabel ? 'ws-token-value-main ws-token-value-main--separated' : 'ws-token-value-main'
      }
    >
      {showDerivationPopover ? (
        <Popover
          aria-label={`How ${tokenName} is derived for this theme`}
          headerContent={tokenName}
          bodyContent={
            <TokenDerivationPopoverBody
              themeName={themeName}
              themeToken={themeToken}
              showThemeLabel={showThemeLabel}
              exhibitsThemeVariantValues={exhibitsThemeVariantValues}
              onNavigate={onNavigate}
              mergedTokens={mergedTokens}
            />
          }
          position="bottom"
          minWidth="400px"
        >
          <Button
            variant="link"
            isInline
            component="span"
            className="ws-token-value-popover-trigger"
            aria-label={`Show how ${tokenName} is derived`}
          >
            {valueMain}
          </Button>
        </Popover>
      ) : (
        valueMain
      )}
    </FlexItem>
  );

  // Handle themeName being either a string or array of strings (when grouped by value)
  const themeNames = Array.isArray(themeName) ? themeName : [themeName];
  const themeKey = themeNames.join('-');
  const isGrouped = themeNames.length > 1;

  return (
    <div className="ws-token-value-line" key={`${themeKey}-${tokenName}`}>
      <ThemeLabelAbbrevContext.Provider value={true}>
        <Flex
          className="ws-token-value-line-inner"
          direction={{ default: 'row' }}
          alignItems={{ default: 'alignItemsCenter' }}
          flexWrap={{ default: 'nowrap' }}
          spaceItems={{ default: 'spaceItemsSm' }}
        >
          {showThemeLabel && (
            <FlexItem className="ws-theme-label-inline">
              {isGrouped ? (
                // Show count for grouped themes with tooltip showing full names
                <Tooltip
                  content={
                    <ThemeLabelAbbrevContext.Provider value={false}>
                      <div>
                        {themeNames.map((name) => (
                          <div key={name}>
                            <ThemeDisplayLabel themeName={name} />
                          </div>
                        ))}
                      </div>
                    </ThemeLabelAbbrevContext.Provider>
                  }
                  position="top"
                  minWidth="400px"
                  maxWidth="600px"
                >
                  <span className="ws-theme-group-label" tabIndex={0}>
                    {themeNames.length} themes
                  </span>
                </Tooltip>
              ) : (
                // ThemeDisplayLabel already handles tooltips when abbreviated
                <ThemeDisplayLabel themeName={themeNames[0]} />
              )}
            </FlexItem>
          )}
          {valueFlexItem}
        </Flex>
      </ThemeLabelAbbrevContext.Provider>
    </div>
  );
};

const OtherCategoryResults = ({ otherResults, onCategoryClick }) => {
  if (Object.keys(otherResults).length === 0) {
    return null;
  }

  return (
    <div style={{
      marginBlockStart: 'var(--pf-t--global--spacer--md)',
      marginBlockEnd: 'var(--pf-t--global--spacer--md)',
      paddingBlock: 'var(--pf-t--global--spacer--sm)',
      paddingInline: 'var(--pf-t--global--spacer--sm)',
      backgroundColor: 'var(--pf-t--global--background--color--secondary--default)',
      borderRadius: 'var(--pf-t--global--border--radius--small)',
      border: 'var(--pf-t--global--border--width--regular) solid var(--pf-t--global--border--color--default)'
    }}>
      <strong>Also found in: </strong>
      {Object.entries(otherResults).map(([category, tokens], index) => (
        <React.Fragment key={category}>
          {index > 0 && ', '}
          <Button
            variant="link"
            isInline
            onClick={() => onCategoryClick(category)}
          >
            {capitalize(category)} ({tokens.length})
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};

const UsedByCell = ({ tokenName, referenceMap, onNavigate }) => {
  const references = referenceMap[tokenName] || [];

  if (references.length === 0) {
    return <Td>—</Td>;
  }

  if (references.length <= 3) {
    return (
      <Td>
        <Flex direction={{ default: 'column' }} rowGap={{ default: 'gapSm' }}>
          {references.map((ref, index) => (
            <FlexItem key={index}>
              <Button
                variant="link"
                isInline
                onClick={() => onNavigate(ref.category, ref.tokenName)}
              >
                [{capitalize(ref.category)}] {ref.tokenName}
              </Button>
            </FlexItem>
          ))}
        </Flex>
      </Td>
    );
  }

  // 4+ references: show count with popover
  return (
    <Td>
      <Popover
        headerContent={`Used by ${references.length} tokens`}
        bodyContent={
          <Flex direction={{ default: 'column' }} rowGap={{ default: 'gapSm' }}>
            {references.map((ref, index) => (
              <FlexItem key={index}>
                <Button
                  variant="link"
                  isInline
                  onClick={() => onNavigate(ref.category, ref.tokenName)}
                >
                  [{capitalize(ref.category)}] {ref.tokenName}
                </Button>
              </FlexItem>
            ))}
          </Flex>
        }
        position="left"
        minWidth="400px"
      >
        <Button variant="link" isInline>
          {references.length} tokens
        </Button>
      </Popover>
    </Td>
  );
};

const TokensTableBody = ({
  token,
  isSemanticLayer,
  isChartLayer,
  isBaseLayer,
  isPaletteLayer,
  exhibitsThemeVariantValues,
  selectedTheme,
  referenceMap,
  onNavigate,
  mergedTokens,
  allAvailableThemes
}) => {
  const [tokenName, tokenData] = token;
  const tokenThemesArr = getThemeEntriesForDisplay(tokenData, selectedTheme, exhibitsThemeVariantValues, allAvailableThemes);
  const tokenDescription = tokenThemesArr[0]?.[1]?.description || '';
  const showUsedBy = isBaseLayer || isPaletteLayer;

  return (
    <Tbody>
      <Tr>
        <Td>
          <code>{tokenName}</code>
        </Td>
        <Td className="tokens-table-value-cell">
          <Flex className="tokens-table-value-stack" direction={{ default: 'column' }} rowGap={{ default: 'gapMd' }}>
            {tokenThemesArr.map(([themeName, themeToken], index) => {
              // themeName can be a string or array of strings (when grouped by value)
              const key = Array.isArray(themeName) ? themeName.join('-') : themeName;
              return (
                <FlexItem key={key}>
                  <TokenValue
                    themeName={themeName}
                    themeToken={themeToken}
                    tokenName={tokenName}
                    showThemeLabel={
                      exhibitsThemeVariantValues &&
                      (selectedTheme !== 'all' || tokenThemesArr.length > 1)
                    }
                    exhibitsThemeVariantValues={exhibitsThemeVariantValues}
                    showDerivationPopover={
                      (isSemanticLayer || isChartLayer || isBaseLayer) &&
                      (Boolean(themeToken?.references?.[0]) || getIsColor(themeToken?.value))
                    }
                    onNavigate={onNavigate}
                    mergedTokens={mergedTokens}
                  />
                </FlexItem>
              );
            })}
          </Flex>
        </Td>
        {isSemanticLayer && <Td>{tokenDescription}</Td>}
        {showUsedBy && <UsedByCell tokenName={tokenName} referenceMap={referenceMap} onNavigate={onNavigate} />}
      </Tr>
    </Tbody>
  );
};

export const TokensTable = ({ tokenJson }) => {
  // state variables
  const [searchValue, setSearchValue] = React.useState('');
  const abbreviateThemes = useAbbreviateThemesByViewport();
  const [selectedCategory, setSelectedCategory] = React.useState('semantic');
  // All categories share the same theme selection except palette (which is always 'all')
  const [sharedTheme, setSharedTheme] = React.useState('default');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  // Palette always uses 'all', other categories use shared theme
  const selectedTheme = selectedCategory === 'palette' ? 'all' : sharedTheme;

  // Memoize sorted theme names to avoid creating new arrays on every render
  const sortedThemeNames = React.useMemo(
    () => Object.keys(tokenJson).sort(compareThemeNames),
    [tokenJson]
  );

  // Per-theme JSON module references are stable across MDX re-renders
  const mergeDepList = React.useMemo(
    () => sortedThemeNames.map((themeName) => tokenJson[themeName]),
    [sortedThemeNames, tokenJson]
  );

  const mergedTokens = React.useMemo(() => getTokensFromJson(tokenJson), mergeDepList);

  const themeOptions = React.useMemo(() => ['all', ...sortedThemeNames], [sortedThemeNames]);

  // List of all available themes (excluding 'all')
  const allAvailableThemes = React.useMemo(() => sortedThemeNames, [sortedThemeNames]);

  // Build reference map for "Used by" column
  const referenceMap = React.useMemo(() => buildReferenceMap(mergedTokens), [mergedTokens]);

  const deferredSearchValue = React.useDeferredValue(searchValue);

  const tokenCategoryOrder = ['chart', 'semantic', 'base', 'palette'];
  const allCategoryKeys = React.useMemo(
    () => Object.keys(mergedTokens).filter((c) => c !== 'default'),
    [mergedTokens]
  );
  const allCategoriesArr = React.useMemo(
    () => [
      ...tokenCategoryOrder.filter((c) => allCategoryKeys.includes(c)),
      ...allCategoryKeys.filter((c) => !tokenCategoryOrder.includes(c)).sort()
    ],
    [allCategoryKeys]
  );

  const isSemanticLayer = selectedCategory === 'semantic';
  const isChartLayer = selectedCategory === 'chart';
  const isBaseLayer = selectedCategory === 'base';
  const isPaletteLayer = selectedCategory === 'palette';
  // Base tokens can have theme variants (e.g., high contrast differs), only palette is truly invariant
  const exhibitsThemeVariantValues = selectedCategory === 'semantic' || selectedCategory === 'chart' || selectedCategory === 'base';
  const showUsedByColumn = isBaseLayer || isPaletteLayer;
  const categoryTokens = mergedTokens[selectedCategory];
  const categoryTokensArr = React.useMemo(
    () => getCategoryTokensArr(selectedCategory, categoryTokens),
    [selectedCategory, categoryTokens]
  );

  // When searching, search across all categories; otherwise just filter current category
  const hasSearchTerm = deferredSearchValue && deferredSearchValue.trim() !== '';
  const searchResultsByCategory = React.useMemo(
    () => (hasSearchTerm ? getFilteredTokensByCategory(mergedTokens, allCategoriesArr, deferredSearchValue) : {}),
    [mergedTokens, allCategoriesArr, deferredSearchValue, hasSearchTerm]
  );

  // Always show current category results
  const searchResults = React.useMemo(
    () => getFilteredTokens(categoryTokensArr, deferredSearchValue),
    [categoryTokensArr, deferredSearchValue]
  );

  // Other categories with results (excluding current category)
  const otherCategoryResults = React.useMemo(() => {
    if (!hasSearchTerm) {
      return {};
    }
    const others = { ...searchResultsByCategory };
    delete others[selectedCategory];
    return others;
  }, [hasSearchTerm, searchResultsByCategory, selectedCategory]);

  // Memoize results count to prevent SearchInput from losing focus
  const resultsCount = React.useMemo(() => searchResults.length.toString(), [searchResults.length]);

  // Pagination calculations
  const totalItems = searchResults.length;
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedResults = React.useMemo(
    () => searchResults.slice(startIndex, endIndex),
    [searchResults, startIndex, endIndex]
  );

  // Reset to page 1 when search or category changes
  React.useEffect(() => {
    setPage(1);
  }, [deferredSearchValue, selectedCategory]);

  const handleSetPage = (_event, newPage) => {
    setPage(newPage);
  };

  const handlePerPageSelect = (_event, newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleCategoryChange = React.useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Memoize setters to prevent TokensToolbar from re-rendering unnecessarily
  const handleSearchChange = React.useCallback((value) => {
    setSearchValue(value);
  }, []);

  const handleThemeChange = React.useCallback((theme) => {
    // Update shared theme (palette is always 'all' and selector is disabled, so this won't be called for palette)
    setSharedTheme(theme);
  }, []);

  // Navigate to category and search for specific token
  const handleNavigateToToken = React.useCallback((category, tokenName) => {
    setSelectedCategory(category);
    setSearchValue(tokenName);
    setPage(1); // Reset to first page
  }, []);

  // Chart tokens have more space, so don't abbreviate theme labels
  const shouldAbbreviate = abbreviateThemes && !isChartLayer;

  return (
    <ThemeLabelAbbrevContext.Provider value={shouldAbbreviate}>
      <React.Fragment>
        <TokensToolbar
          searchValue={searchValue}
          setSearchValue={handleSearchChange}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          selectedTheme={selectedTheme}
          setSelectedTheme={handleThemeChange}
          themeOptions={themeOptions}
          resultsCount={resultsCount}
          categories={allCategoriesArr}
        />
        {exhibitsThemeVariantValues && <ThemeAbbrevLegend />}
        <OuterScrollContainer className="tokens-table-outer-wrapper">
        <InnerScrollContainer>
          <Title headingLevel="h2">{capitalize(selectedCategory)} tokens</Title>
          {searchResults.length > 0 ? (
            <>
              <OtherCategoryResults
                otherResults={otherCategoryResults}
                onCategoryClick={handleCategoryChange}
              />
              <Pagination
                itemCount={totalItems}
                perPage={perPage}
                page={page}
                onSetPage={handleSetPage}
                onPerPageSelect={handlePerPageSelect}
                perPageOptions={[
                  { title: '10', value: 10 },
                  { title: '20', value: 20 },
                  { title: '50', value: 50 },
                  { title: '100', value: 100 }
                ]}
                variant="top"
              />
              <Table
                variant="compact"
                className="tokens-table-fixed-layout"
                style={{ marginBlockEnd: `var(--pf-t--global--spacer--xl)` }}
              >
                <Thead>
                  <Tr>
                    <Th width={isSemanticLayer ? 33 : showUsedByColumn ? 30 : isChartLayer ? 40 : 52}>Name</Th>
                    <Th modifier="breakWord" width={isSemanticLayer ? 46 : showUsedByColumn ? 40 : isChartLayer ? 60 : 48}>
                      Value
                    </Th>
                    {isSemanticLayer && <Th width={21}>Description</Th>}
                    {showUsedByColumn && <Th width={30}>Used by</Th>}
                  </Tr>
                </Thead>

                {paginatedResults.map((token) => (
                  <TokensTableBody
                    key={token[0]}
                    token={token}
                    isSemanticLayer={isSemanticLayer}
                    isChartLayer={isChartLayer}
                    isBaseLayer={isBaseLayer}
                    isPaletteLayer={isPaletteLayer}
                    exhibitsThemeVariantValues={exhibitsThemeVariantValues}
                    selectedTheme={selectedTheme}
                    referenceMap={referenceMap}
                    onNavigate={handleNavigateToToken}
                    mergedTokens={mergedTokens}
                    allAvailableThemes={allAvailableThemes}
                  />
                ))}
              </Table>
              <Pagination
                itemCount={totalItems}
                perPage={perPage}
                page={page}
                onSetPage={handleSetPage}
                onPerPageSelect={handlePerPageSelect}
                perPageOptions={[
                  { title: '10', value: 10 },
                  { title: '20', value: 20 },
                  { title: '50', value: 50 },
                  { title: '100', value: 100 }
                ]}
                variant="bottom"
              />
            </>
          ) : (
            <EmptyState titleText="No results found" headingLevel="h4" icon={SearchIcon}>
              <EmptyStateBody>No results match the filter criteria. Clear all filters and try again.</EmptyStateBody>
              <EmptyStateFooter>
                <EmptyStateActions>
                  <Button onClick={() => setSearchValue('')} variant="link">
                    Clear search
                  </Button>
                </EmptyStateActions>
              </EmptyStateFooter>
            </EmptyState>
          )}
        </InnerScrollContainer>
      </OuterScrollContainer>
      </React.Fragment>
    </ThemeLabelAbbrevContext.Provider>
  );
};
