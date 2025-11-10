import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateActions,
  Flex,
  FlexItem,
  Grid,
  GridItem,
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
  ExpandableRowContent,
  OuterScrollContainer,
  InnerScrollContainer
} from '@patternfly/react-table';
import { TokensToolbar } from './tokensToolbar';
import './tokensTable.css';
import SearchIcon from '@patternfly/react-icons/dist/esm/icons/search-icon';

import c_expandable_section_m_display_lg_PaddingInlineStart from '@patternfly/react-tokens/dist/esm/c_expandable_section_m_display_lg_PaddingInlineStart';
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

{
  /* Helper functions */
}
// Used to combine data grouped by theme under each token name
const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return Object.assign(target || {}, source);
};

const getTokensFromJson = (tokenJson) => {
  // parse tokens from json, convert from modules, merge into single allTokens obj
  const themesArr = Object.keys(tokenJson);
  const themesObj = themesArr.reduce((acc, cur) => {
    acc[cur] = JSON.parse(JSON.stringify(tokenJson[cur]));
    return acc;
  }, {});
  return deepMerge(...Object.values(themesObj));
};

const getTokenChain = (themeTokenData) => {
  let tokenChain = [];
  // Palette & some color tokens don't have references but we still want to still show their values
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
  // Show final value if isColorToken but no references - otherwise color value not displayed in table
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

const getIsColor = (value) => /^(#|rgb)/.test(value);

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

{
  /* Components */
}
const TokenChain = ({ tokenThemesArr }) => (
  <Tr isExpanded>
    <Td />
    <Td colSpan={3}>
      <ExpandableRowContent>
        <Grid hasGutter>
          {tokenThemesArr.map(([themeName, themeToken]) => (
            <React.Fragment key={themeName}>
              <GridItem span={2}>{capitalize(themeName)}:</GridItem>
              <GridItem span={10}>{showTokenChain(themeToken)}</GridItem>
            </React.Fragment>
          ))}
        </Grid>
      </ExpandableRowContent>
    </Td>
  </Tr>
);

const TokenValue = ({ themeName, themeToken, tokenName }) => {
  const isColor = getIsColor(themeToken.value);
  return (
    <Flex
      justifyContent={{ default: 'justify-content-space-between' }}
      flexWrap={{ default: 'nowrap' }}
      key={`${themeName}-${tokenName}`}
    >
      <FlexItem>{capitalize(themeName)}:</FlexItem>
      {isColor ? (
        <FlexItem key={`${themeName}_${tokenName}_swatch`} className="pf-v6-l-flex pf-m-column pf-m-align-self-center">
          <span className="ws-token-swatch" style={{ backgroundColor: themeToken.value }} />
        </FlexItem>
      ) : (
        <div className="pf-v6-l-flex pf-m-column pf-m-align-self-center">{themeToken.value}</div>
      )}
    </Flex>
  );
};

const TokensTableBody = ({ token, expandedTokens, setExpanded, isSemanticLayer, rowIndex }) => {
  const [tokenName, tokenData] = token;
  const tokenThemesArr = Object.entries(tokenData);
  const isExpandable = tokenThemesArr.some(
    ([_themeName, themeToken]) => themeToken.hasOwnProperty('references') || getIsColor(themeToken.value)
  );
  const isTokenExpanded = expandedTokens.includes(tokenName);
  const tokenDescription = tokenThemesArr[0][1].description;

  return (
    <Tbody isExpanded={isTokenExpanded}>
      <Tr>
        {/* Expandable row icon */}
        <Td
          expand={
            isExpandable && {
              rowIndex,
              isExpanded: isTokenExpanded,
              onToggle: () => setExpanded(tokenName, !isTokenExpanded),
              expandId: `${tokenName}-expandable-toggle`
            }
          }
        />
        <Td>
          <code>{tokenName}</code>
        </Td>
        {/* Token values for each theme */}
        <Td>
          {tokenThemesArr.map(([themeName, themeToken]) => (
            <TokenValue themeName={themeName} themeToken={themeToken} tokenName={tokenName} key={themeName} />
          ))}
        </Td>

        {/* Description - only for semantic tokens */}
        {isSemanticLayer && <Td>{tokenDescription}</Td>}
      </Tr>

      {/* Expandable token chain */}
      {isTokenExpanded && <TokenChain tokenThemesArr={tokenThemesArr} />}
    </Tbody>
  );
};

export const TokensTable = ({ tokenJson }) => {
  // state variables
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedTokens, setExpandedTokens] = React.useState([]);
  const [selectedCategory, setSelectedCategory] = React.useState('semantic');

  const allTokens = getTokensFromJson(tokenJson);
  const isSemanticLayer = selectedCategory === 'semantic';
  const categoryTokens = allTokens[selectedCategory];
  // get tokens for selected category
  const categoryTokensArr = getCategoryTokensArr(selectedCategory, categoryTokens);
  // filter selected category tokens based on search term
  const searchResults = getFilteredTokens(categoryTokensArr, searchValue);
  // remove extra 'default' category
  delete allTokens.default;
  const allCategoriesArr = Object.keys(allTokens);

  // helper funcs
  const setExpanded = (tokenName, isExpanding = true) =>
    setExpandedTokens((prevExpanded) => {
      const otherExpandedTokens = prevExpanded.filter((n) => n !== tokenName);
      return isExpanding ? [...otherExpandedTokens, tokenName] : otherExpandedTokens;
    });

  return (
    <React.Fragment>
      <TokensToolbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        resultsCount={searchResults.length.toString()}
        categories={allCategoriesArr}
      />
      <OuterScrollContainer className="tokens-table-outer-wrapper">
        <InnerScrollContainer>
          <Title headingLevel="h2">{capitalize(selectedCategory)} tokens</Title>
          {searchResults.length > 0 ? (
            <Table variant="compact" style={{ marginBlockEnd: `var(--pf-t--global--spacer--xl)` }}>
              <Thead>
                <Tr>
                  {/* Only semantic tokens have description, adjust columns accordingly */}
                  <Th width={5} screenReaderText="Row expansion"></Th>
                  <Th width={isSemanticLayer ? 60 : 80}>Name</Th>
                  <Th width={isSemanticLayer ? 10 : 15}>Value</Th>
                  {isSemanticLayer && <Th width={25}>Description</Th>}
                </Tr>
              </Thead>

              {/* Loop through row for each token in current layer */}
              {searchResults.map((token, rowIndex) => (
                <TokensTableBody
                  key={rowIndex}
                  token={token}
                  expandedTokens={expandedTokens}
                  setExpanded={setExpanded}
                  isSemanticLayer={isSemanticLayer}
                  rowIndex={rowIndex}
                />
              ))}
            </Table>
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
  );
};
