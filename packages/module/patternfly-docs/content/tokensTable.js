import React from 'react';
import {
  Flex,
  FlexItem,
  Grid,
  GridItem,
  Tabs,
  Tab,
  TabContent,
  TabTitleText,
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

// eslint-disable-next-line camelcase
import global_spacer_md from '@patternfly/react-tokens/dist/esm/global_spacer_md';
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

// Used to combine data grouped by theme under each token name
const deepMerge = (target, source) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  return Object.assign(target || {}, source);
};

const getTokenChain = (themeTokenData) => {
  let tokenChain = [];
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
            padding: `4px 0 4px calc(${global_spacer_md.value} * ${index})`
          }}
        >
          <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
          <span style={{ paddingInlineStart: global_spacer_md.value }}>{nextValue}</span>
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

export const TokensTable = ({ tokenJson, formatThemeText = capitalize }) => {
  // parse tokens from json, convert from modules, merge into single allTokens obj
  const themesArr = Object.keys(tokenJson);
  const themesObj = themesArr.reduce((acc, cur) => {
    acc[cur] = JSON.parse(JSON.stringify(tokenJson[cur]));
    return acc;
  }, {});
  const allTokens = deepMerge(...Object.values(themesObj));
  // remove default property which is duplicate of other fields
  delete allTokens.default;

  // state variables
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedTokens, setExpandedTokens] = React.useState([]);
  const [selectedCategories, setSelectedCategories] = React.useState([]);

  // helper funcs
  const isTokenExpanded = (tokenName) => expandedTokens.includes(tokenName);
  const isSelectedCategory = (categoryName) =>
    selectedCategories.length === 0 || selectedCategories.includes(categoryName);
  const setExpanded = (tokenName, isExpanding = true) =>
    setExpandedTokens((prevExpanded) => {
      const otherExpandedTokens = prevExpanded.filter((n) => n !== tokenName);
      return isExpanding ? [...otherExpandedTokens, tokenName] : otherExpandedTokens;
    });
  const [activeTabKey, setActiveTabKey] = React.useState(0);
  // Toggle currently active tab
  const handleTabClick = (_event, tabIndex) => setActiveTabKey(tabIndex);
  const tokenLayers = Object.keys(allTokens);
  // create refs for each layer for tabs
  let tabRefs = {};
  tokenLayers.forEach((layer) => {
    tabRefs[`${layer}Ref`] = React.createRef();
  });

  return (
    <React.Fragment>
      <TokensToolbar
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <Tabs
        unmountOnExit
        activeKey={activeTabKey}
        onSelect={handleTabClick}
        aria-label="Tabs to select tokens layer"
        role="region"
      >
        {tokenLayers.map((layer, idx) => (
          <Tab
            key={idx}
            eventKey={idx}
            title={<TabTitleText>{formatThemeText(layer)} tokens</TabTitleText>}
            aria-label={`${layer} tokens content`}
            tabContentId={`${layer}TokensTabContent`}
            tabContentRef={tabRefs[`${layer}Ref`]}
          />
        ))}
      </Tabs>
      <OuterScrollContainer className="tokens-table-outer-wrapper">
        <InnerScrollContainer>
          {
            // Create new Table for each tokens layer [base, chart, palette, semantic]
            Object.entries(allTokens).map(([layerName, layerDataObj], idx) => {
              // save if semantic layer - used for custom styling due to description field
              const isSemanticLayer = layerName === 'semantic';

              // Create array of all tokens/nested tokens in layer, filtered by selectedCategories
              let layerTokens = [];
              if (!['base', 'semantic'].includes(layerName) && isSelectedCategory(layerName)) {
                layerTokens = Object.entries(layerDataObj);
              } else {
                // base/semantic combine subcategory tokens into flattened arr
                for (var subLayer in layerDataObj) {
                  isSelectedCategory(subLayer) && layerTokens.push(...Object.entries(layerDataObj[subLayer]));
                }
              }
              // finally filter all tokens based on search term
              const filteredTokens = layerTokens.filter(([tokenName, tokenData]) =>
                isSearchMatch(searchValue, tokenName, tokenData)
              );

              return (
                <TabContent
                  eventKey={idx}
                  id={`${layerName}TokensTabContent`}
                  ref={tabRefs[`${layerName}Ref`]}
                  aria-label={`${layerName} tokens tab content`}
                >
                  <Title headingLevel="h2" id={`${layerName}-table`} className="pf-v6-u-mt-xl">
                    {formatThemeText(layerName)} tokens
                  </Title>
                  <Table variant="compact" style={{ marginBlockEnd: `var(--pf-t--global--spacer--xl)` }}>
                    <Thead>
                      <Tr>
                        {/* Only semantic tokens have description, adjust columns accordingly */}
                        <Th width={5}></Th>
                        <Th width={isSemanticLayer ? 60 : 80}>Name</Th>
                        <Th width={isSemanticLayer ? 10 : 15}>Value</Th>
                        {isSemanticLayer && <Th width={25}>Description</Th>}
                      </Tr>
                    </Thead>

                    {/* Loop through row for each token in current layer */}
                    {filteredTokens.map(([tokenName, tokenData], rowIndex) => {
                      const tokenThemesArr = Object.entries(tokenData);
                      const hasReferences = tokenThemesArr.some(([_themeName, themeToken]) =>
                        themeToken.hasOwnProperty('references')
                      );
                      const isColorToken = tokenThemesArr[0][1].type === 'color';
                      const tokenDescription = tokenThemesArr[0][1].description;

                      return (
                        <Tbody key={`row-${tokenName}`} isExpanded={isTokenExpanded(tokenName)}>
                          <Tr>
                            {/* Expandable row icon */}
                            <Td
                              expand={
                                hasReferences || isColorToken
                                  ? {
                                      rowIndex,
                                      isExpanded: isTokenExpanded(tokenName),
                                      onToggle: () => setExpanded(tokenName, !isTokenExpanded(tokenName)),
                                      expandId: `${tokenName}-expandable-toggle`
                                    }
                                  : undefined
                              }
                            />
                            <Td>
                              <code>{tokenName}</code>
                            </Td>
                            {/* Token values for each theme */}
                            <Td>
                              {tokenThemesArr.map(([themeName, themeToken]) => {
                                const isColor = /^(#|rgb)/.test(themeToken.value);
                                return (
                                  <Flex
                                    justifyContent={{ default: 'justify-content-space-between' }}
                                    flexWrap={{ default: 'nowrap' }}
                                    key={`${themeName}-${tokenName}`}
                                  >
                                    <FlexItem>{formatThemeText(themeName)}:</FlexItem>
                                    {isColor ? (
                                      <FlexItem
                                        key={`${themeName}_${tokenName}_swatch`}
                                        className="pf-v6-l-flex pf-m-column pf-m-align-self-center"
                                      >
                                        <span
                                          className="ws-token-swatch"
                                          style={{ backgroundColor: themeToken.value }}
                                        />
                                      </FlexItem>
                                    ) : (
                                      <div className="pf-v6-l-flex pf-m-column pf-m-align-self-center">
                                        {themeToken.value}
                                      </div>
                                    )}
                                  </Flex>
                                );
                              })}
                            </Td>
                            {/* Description - only for semantic tokens */}
                            {isSemanticLayer && <Td>{tokenDescription}</Td>}
                          </Tr>

                          {/* Expandable token chain */}
                          {(hasReferences || isColorToken) && isTokenExpanded(tokenName) && (
                            <Tr isExpanded>
                              <Td />
                              <Td colSpan={3}>
                                <ExpandableRowContent>
                                  <Grid hasGutter>
                                    {tokenThemesArr.map(([themeName, themeToken]) => (
                                      <>
                                        <GridItem span={2}>{formatThemeText(themeName)}:</GridItem>
                                        <GridItem span={10}>{showTokenChain(themeToken, hasReferences)}</GridItem>
                                      </>
                                    ))}
                                  </Grid>
                                </ExpandableRowContent>
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      );
                    })}
                  </Table>
                </TabContent>
              );
            })
          }
        </InnerScrollContainer>
      </OuterScrollContainer>
    </React.Fragment>
  );
};
