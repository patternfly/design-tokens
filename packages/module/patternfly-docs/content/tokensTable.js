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
  const themesArr = Object.keys(tokenJson);
  const allTokens = {};

  const mergeThemeData = (themeName, source, target) => {
    Object.entries(source).forEach(([key, value]) => {
      if (
        value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        (value.hasOwnProperty('default') || value.hasOwnProperty('dark')) &&
        Object.keys(value).length === 1
      ) {
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
  // match search term to token name, value, and description
  searchValue = searchValue.toLowerCase();
  return (
    tokenName.toLowerCase().includes(searchValue) ||
    Object.entries(tokenData).some(
      ([_themeName, themeData]) =>
        themeData?.value?.toString().toLowerCase().includes(searchValue) ||
        themeData?.description?.toLowerCase().includes(searchValue)
    )
  );
};

const getFilteredTokens = (tokensArr, searchVal) =>
  tokensArr.filter(([tokenName, tokenData]) => isSearchMatch(searchVal, tokenName, tokenData));

const getIsColor = (value) => {
  // Extract the actual value if it's nested in an object
  const actualValue = (value && typeof value === 'object' && value.default) ? value.default : value;
  return /^(#|rgb)/.test(actualValue);
};


const getCategoryTokensArr = (selectedCategory, categoryTokens) => {
  // Create array of all tokens/nested tokens in selectedCategory
  let categoryTokensArr = [];
  if (!['base', 'semantic'].includes(selectedCategory)) {
    categoryTokensArr = Object.entries(categoryTokens);
  } else if (['base', 'semantic'].includes(selectedCategory)) {
    // base/semantic combine nested subcategory tokens into flattened arr
    for (var subCategory in categoryTokens) {
      categoryTokensArr.push(...Object.entries(categoryTokens[subCategory]));
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

const getThemeEntriesForDisplay = (tokenData, selectedTheme, exhibitsThemeVariantValues) => {
  const normalizeThemeValue = (themeValue) => {
    if (!themeValue) return themeValue;
    // If it has a default property, use that (for some token structures)
    if (themeValue?.default) return themeValue.default;
    // If it's an object with a value property, extract the value
    if (typeof themeValue === 'object' && themeValue.value !== undefined) {
      return themeValue;
    }
    // Otherwise return as-is
    return themeValue;
  };

  if (selectedTheme === 'all') {
    if (!exhibitsThemeVariantValues) {
      // For base/palette tokens, show only one value since they don't vary by theme
      const firstTheme = Object.keys(tokenData)[0];
      return [[firstTheme, normalizeThemeValue(tokenData[firstTheme])]];
    }
    return Object.entries(tokenData)
      .map(([themeName, themeValue]) => [themeName, normalizeThemeValue(themeValue)])
      .sort(([themeA], [themeB]) => compareThemeNames(themeA, themeB));
  }

  const tokenValue = normalizeThemeValue(tokenData[selectedTheme]) || {
    value: '',
    description: tokenData[Object.keys(tokenData)[0]]?.description || '',
    references: []
  };
  return [[selectedTheme, tokenValue]];
};

const getTokenChain = (themeTokenData) => {
  let tokenChain = [];
  if (!themeTokenData?.references?.[0]) {
    tokenChain.push(themeTokenData.value);
  } else {
    let referenceToken = themeTokenData?.references?.[0];
    while (referenceToken && referenceToken !== undefined) {
      tokenChain = [...tokenChain, referenceToken.name];
      if (referenceToken?.references?.[0]) {
        referenceToken = referenceToken?.references?.[0];
      } else {
        tokenChain.push(referenceToken.value);
        break;
      }
    }
  }
  return tokenChain;
};

const showTokenChain = (themeTokenData, hasReferences) => {
  const tokenChain = hasReferences ? getTokenChain(themeTokenData) : [themeTokenData.value];
  return (
    <div>
      {tokenChain.map((nextValue, index) => (
        <div
          key={`${index}`}
          style={{
            padding: `4px 0 4px calc(${c_expandable_section_m_display_lg_PaddingInlineStart.value} * ${index})`
          }}
        >
          <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
          <span style={{ paddingInlineStart: c_expandable_section_m_display_lg_PaddingInlineStart.value }}>
            {nextValue}
          </span>
        </div>
      ))}
    </div>
  );
};

{
  /* Components */
}
const TokenDerivationPopoverBody = ({ themeName, themeToken, showThemeLabel, exhibitsThemeVariantValues }) => {
  const hasReferences = Boolean(themeToken?.references?.[0]);
  return (
    <ThemeLabelAbbrevContext.Provider value={false}>
      <div className="ws-token-derivation-popover">
        {exhibitsThemeVariantValues && showThemeLabel && (
          <div className="ws-token-derivation-popover__theme">
            <ThemeDisplayLabel themeName={themeName} />
          </div>
        )}
        {showTokenChain(themeToken, hasReferences)}
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
  exhibitsThemeVariantValues
}) => {
  // Extract the actual value from token.value if it's nested in an object
  let displayValue = themeToken.value;
  if (themeToken.value && typeof themeToken.value === 'object') {
    // If value is an object with theme keys, extract the first value
    displayValue = Object.values(themeToken.value)[0];
  }

  // If displayValue is still an object, it shouldn't be rendered
  if (typeof displayValue === 'object') {
    return null;
  }

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
            />
          }
          position="bottom"
          minWidth="280px"
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

  return (
    <div className="ws-token-value-line" key={`${themeName}-${tokenName}`}>
      <Flex
        className="ws-token-value-line-inner"
        direction={{ default: 'row' }}
        alignItems={{ default: 'alignItemsCenter' }}
        flexWrap={{ default: 'nowrap' }}
        spaceItems={{ default: 'spaceItemsSm' }}
      >
        {showThemeLabel && (
          <FlexItem className="ws-theme-label-inline">
            <ThemeDisplayLabel themeName={themeName} />
          </FlexItem>
        )}
        {valueFlexItem}
      </Flex>
    </div>
  );
};

const TokensTableBody = ({ token, isSemanticLayer, isChartLayer, exhibitsThemeVariantValues, selectedTheme }) => {
  const [tokenName, tokenData] = token;
  const tokenThemesArr = getThemeEntriesForDisplay(tokenData, selectedTheme, exhibitsThemeVariantValues);
  const tokenDescription = tokenThemesArr[0]?.[1]?.description || '';

  return (
    <Tbody>
      <Tr>
        <Td>
          <code>{tokenName}</code>
        </Td>
        <Td className="tokens-table-value-cell">
          <Flex className="tokens-table-value-stack" direction={{ default: 'column' }} rowGap={{ default: 'gapMd' }}>
            {tokenThemesArr.map(([themeName, themeToken]) => (
              <FlexItem key={themeName}>
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
                    (isSemanticLayer || isChartLayer) &&
                    (Boolean(themeToken?.references?.[0]) || getIsColor(themeToken?.value))
                  }
                />
              </FlexItem>
            ))}
          </Flex>
        </Td>
        {isSemanticLayer && <Td>{tokenDescription}</Td>}
      </Tr>
    </Tbody>
  );
};

export const TokensTable = ({ tokenJson }) => {
  // state variables
  const [searchValue, setSearchValue] = React.useState('');
  const abbreviateThemes = useAbbreviateThemesByViewport();
  const [selectedCategory, setSelectedCategory] = React.useState('semantic');
  const [selectedTheme, setSelectedTheme] = React.useState('default');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  // Per-theme JSON module references are stable across MDX re-renders; avoid depending on a new inline `tokenJson` object.
  const mergeDepList = Object.keys(tokenJson)
    .sort(compareThemeNames)
    .map((themeName) => tokenJson[themeName]);

  const mergedTokens = React.useMemo(() => getTokensFromJson(tokenJson), mergeDepList);

  const themeOptions = React.useMemo(
    () => ['all', ...Object.keys(tokenJson).sort(compareThemeNames)],
    mergeDepList
  );

  const deferredSearchValue = React.useDeferredValue(searchValue);

  const isSemanticLayer = selectedCategory === 'semantic';
  const isChartLayer = selectedCategory === 'chart';
  const exhibitsThemeVariantValues = selectedCategory === 'semantic' || selectedCategory === 'chart';
  const categoryTokens = mergedTokens[selectedCategory];
  const categoryTokensArr = React.useMemo(
    () => getCategoryTokensArr(selectedCategory, categoryTokens),
    [selectedCategory, categoryTokens]
  );
  const searchResults = React.useMemo(
    () => getFilteredTokens(categoryTokensArr, deferredSearchValue),
    [categoryTokensArr, deferredSearchValue]
  );

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

  const handleCategoryChange = React.useCallback((category) => {
    setSelectedCategory(category);
    // For base and palette tokens, automatically select "All themes"
    if (category === 'base' || category === 'palette') {
      setSelectedTheme('all');
    }
  }, []);

  // Chart tokens have more space, so don't abbreviate theme labels
  const shouldAbbreviate = abbreviateThemes && !isChartLayer;

  return (
    <ThemeLabelAbbrevContext.Provider value={shouldAbbreviate}>
      <React.Fragment>
        <TokensToolbar
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleCategoryChange}
          selectedTheme={selectedTheme}
          setSelectedTheme={setSelectedTheme}
          themeOptions={themeOptions}
          resultsCount={searchResults.length.toString()}
          categories={allCategoriesArr}
        />
        {shouldAbbreviate && exhibitsThemeVariantValues && <ThemeAbbrevLegend />}
        <OuterScrollContainer className="tokens-table-outer-wrapper">
        <InnerScrollContainer>
          <Title headingLevel="h2">{capitalize(selectedCategory)} tokens</Title>
          {searchResults.length > 0 ? (
            <>
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
                    <Th width={isSemanticLayer ? 33 : isChartLayer ? 40 : 52}>Name</Th>
                    <Th modifier="breakWord" width={isSemanticLayer ? 46 : isChartLayer ? 60 : 48}>
                      Value
                    </Th>
                    {isSemanticLayer && <Th width={21}>Description</Th>}
                  </Tr>
                </Thead>

                {paginatedResults.map((token) => (
                  <TokensTableBody
                    key={token[0]}
                    token={token}
                    isSemanticLayer={isSemanticLayer}
                    isChartLayer={isChartLayer}
                    exhibitsThemeVariantValues={exhibitsThemeVariantValues}
                    selectedTheme={selectedTheme}
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
