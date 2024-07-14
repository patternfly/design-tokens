import React, { useMemo } from 'react';
import {
  Flex,
  FlexItem,
  Grid,
  GridItem,
  SearchInput,
  Title,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
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
import './tokensTable.css';

// eslint-disable-next-line camelcase
import global_spacer_md from '@patternfly/react-tokens/dist/esm/global_spacer_md';
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

const isColorRegex = /^(#|rgb)/;

// Used to combine data grouped by theme under each token name
const combineObjects = (parentObject) => {
  let combined = {};
  const addToCombined = (obj, objName) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (!combined.hasOwnProperty(key)) {
          combined[key] = {};
        }
        combined[key][objName] = obj[key];
      }
    }
  };
  Object.entries(parentObject).forEach(([key, value]) => {
    addToCombined(value, key);
  });

  return combined;
};

const combineTokens = (tokensObj, tokensByTheme) => {
  Object.entries(tokensObj).map(([layerName, layerObj]) => {
    // ['chart', {}]
    const layerCategories = Object.keys(layerObj); // []
    if (layerCategories.length > 0) {
      Object.keys(layerObj).map((layerCategory) => {
        const layerCategoryByTheme = Object.entries(tokensByTheme).reduce((acc, [themeName, themeData]) => {
          acc[themeName] = themeData[layerName][layerCategory];
          return acc;
        }, {});
        tokensObj[layerName][layerCategory] = combineObjects(layerCategoryByTheme);
      });
    } else {
      const layerByTheme = Object.entries(tokensByTheme).reduce((acc, [themeName, themeData]) => {
        // ['dark', {'palette': { ... }, 'chart': { ... } }]
        acc[themeName] = themeData[layerName]; // {'dark': { ...chart data } }
        return acc;
      }, {});
      tokensObj[layerName] = combineObjects(layerByTheme);
    }
  });
  return tokensObj;
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

const showTokenChain = (themeTokenData) => {
  const tokenChain = getTokenChain(themeTokenData);
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

export const TokensTableCategories = ({ tokenJson, formatThemeText = capitalize }) => {
  const combinedTokensObj = {
    semantic: {
      colors: {},
      dimension: {},
      motion: {}
    },
    base: {
      colors: {},
      dimension: {},
      motion: {}
    },
    palette: {},
    chart: {}
  };
  // combine all themes/tokens into one object
  const themeKeys = Object.keys(tokenJson);
  const tokensByTheme = useMemo(
    () =>
      themeKeys.reduce((allTokensObj, curTheme) => {
        // transform from modules
        const themeTokens = JSON.parse(JSON.stringify(tokenJson[curTheme]));
        allTokensObj[curTheme] = themeTokens;
        return allTokensObj;
      }, {}),
    [tokenJson]
  );
  const allTokens = combineTokens(combinedTokensObj, tokensByTheme);

  const [searchValue, setSearchValue] = React.useState('');
  const [expandedTokens, setExpandedTokens] = React.useState([]);
  const setExpanded = (tokenName, isExpanding = true) =>
    setExpandedTokens((prevExpanded) => {
      const otherExpandedTokens = prevExpanded.filter((n) => n !== tokenName);
      return isExpanding ? [...otherExpandedTokens, tokenName] : otherExpandedTokens;
    });

  const isTokenExpanded = (tokenName) => expandedTokens.includes(tokenName);

  return (
    <React.Fragment>
      <Toolbar id="filter-toolbar">
        <ToolbarContent>
          <ToolbarItem variant="search-filter">
            <SearchInput
              aria-label="Search all tokens"
              placeholder="Search all tokens"
              value={searchValue}
              onChange={(_event, value) => setSearchValue(value)}
              onClear={() => setSearchValue('')}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <OuterScrollContainer>
        <InnerScrollContainer>
          {Object.entries(allTokens).map(([layerName, layerDataObj], _rowIndex) => {
            if (layerName === 'palette') {
              layerDataObj = { palette: layerDataObj };
            }
            if (layerName === 'chart') {
              layerDataObj = { chart: layerDataObj };
            }
            const isSemanticLayer = layerName === 'semantic';
            return (
              <>
                <Title headingLevel="h2">{formatThemeText(layerName)} tokens</Title>
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
                  {Object.entries(layerDataObj).map((layerDataProperties, _rowIndex) => {
                    let [categoryName, categoryDataObj] = layerDataProperties;

                    return Object.entries(categoryDataObj).map(([tokenName, themesDataObj], rowIndex) => {
                      const searchTerm = searchValue.toLowerCase();
                      if (tokenName === 'default') {
                        return undefined;
                      } else if (
                        // Match search value to any token name/value in token chain or to description
                        searchValue !== '' &&
                        !(
                          tokenName.toLowerCase().includes(searchTerm) ||
                          Object.entries(themesDataObj).some(
                            ([_themeName, themeData]) =>
                              themeData?.value?.toString().toLowerCase().includes(searchTerm) ||
                              themeData?.description?.toLowerCase().includes(searchTerm)
                          )
                        )
                      ) {
                        return undefined;
                      } else {
                        const themesDataArr = Object.entries(themesDataObj);

                        let hasReferences = false;
                        let description = null;
                        themesDataArr.map(([_themeName, themeTokenData]) => {
                          // if references values exists anywhere, set isNotResolved to true
                          if (!hasReferences && themeTokenData.references !== undefined) {
                            hasReferences = true;
                          }
                          // Save description first time found - shared across themes
                          if (!description && themeTokenData.description) {
                            description = themeTokenData.description;
                          }
                        });

                        return (
                          <Tbody key={`row-${tokenName}`} isExpanded={isTokenExpanded(tokenName)}>
                            <Tr>
                              {/* Expandable row icon */}
                              <Td
                                expand={
                                  hasReferences
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
                                {themeKeys.map((theme) => {
                                  const val =
                                    layerName === 'palette' || layerName === 'chart'
                                      ? tokensByTheme[theme][layerName][tokenName]?.value
                                      : tokensByTheme[theme][layerName][categoryName][tokenName]?.value;
                                  const hasValue = val !== undefined;
                                  const isColor = isColorRegex.test(val);
                                  return (
                                    <Flex
                                      justifyContent={{ default: 'justify-content-space-between' }}
                                      flexWrap={{ default: 'nowrap' }}
                                      key={`${theme}-${tokenName}`}
                                    >
                                      <FlexItem>{formatThemeText(theme)}:</FlexItem>
                                      {isColor ? (
                                        hasValue && (
                                          <FlexItem
                                            key={`${theme}_${tokenName}_swatch`}
                                            className="pf-v6-l-flex pf-m-column pf-m-align-self-center"
                                          >
                                            <span className="ws-token-swatch" style={{ backgroundColor: val }} />
                                          </FlexItem>
                                        )
                                      ) : (
                                        <div className="pf-v6-l-flex pf-m-column pf-m-align-self-center">
                                          {hasValue ? val : '--'}
                                        </div>
                                      )}
                                    </Flex>
                                  );
                                })}
                              </Td>
                              <Td>{description}</Td>
                            </Tr>

                            {/* Expandable token chain */}
                            {hasReferences && isTokenExpanded(tokenName) && (
                              <Tr isExpanded>
                                <Td />
                                <Td colSpan={3}>
                                  <ExpandableRowContent>
                                    <Grid hasGutter>
                                      {themeKeys.map(
                                        (theme) =>
                                          themesDataObj.hasOwnProperty(theme) && (
                                            <>
                                              <GridItem span={2}>{formatThemeText(theme)}:</GridItem>
                                              <GridItem span={10}>{showTokenChain(themesDataObj[theme])}</GridItem>
                                            </>
                                          )
                                      )}
                                    </Grid>
                                  </ExpandableRowContent>
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        );
                      }
                    });
                  })}
                </Table>
              </>
            );
          })}
        </InnerScrollContainer>
      </OuterScrollContainer>
    </React.Fragment>
  );
};
