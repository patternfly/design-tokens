import React, { useMemo } from 'react';
import { SearchInput, Title, Toolbar, ToolbarItem, ToolbarContent, capitalize } from '@patternfly/react-core';
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
            padding: `4px 0 4px ${global_spacer_md.value}`
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
          {Object.entries(allTokens).map(([layerName, layerDataObj], rowIndex) => {
            if (layerName === 'palette') {
              layerDataObj = { palette: layerDataObj };
            }
            if (layerName === 'chart') {
              layerDataObj = { chart: layerDataObj };
            }
            return (
              <>
                <Title headingLevel="h2">{formatThemeText(layerName)} tokens</Title>
                <Table variant="compact">
                  <Thead>
                    <Tr>
                      <Th></Th>
                      <Th>Name</Th>
                      <Th>Category</Th>
                      {themeKeys.map((theme) => (
                        <Th key={theme}>{`${formatThemeText(theme)} Theme`}</Th>
                      ))}
                      <Th>Description</Th>
                      {/* <Th>Category</Th>
                      <Th>Type</Th>
                      <Th>Item</Th>
                      <Th>Subitem</Th>
                      <Th>State</Th> */}
                    </Tr>
                  </Thead>
                  {Object.entries(layerDataObj).map((layerDataProperties, _rowIndex) => {
                    let [categoryName, categoryDataObj] = layerDataProperties;

                    return Object.entries(categoryDataObj).map(([tokenName, themesDataObj], rowIndex) => {
                      const searchTerm = searchValue.toLowerCase();
                      if (tokenName === 'default') {
                        return undefined;
                      } else if (
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
                              <Td>{categoryName}</Td>
                              {themeKeys.map((theme) => {
                                const val =
                                  layerName === 'palette' || layerName === 'chart'
                                    ? tokensByTheme[theme][layerName][tokenName]?.value
                                    : tokensByTheme[theme][layerName][categoryName][tokenName]?.value;
                                const hasValue = val !== undefined;
                                return (
                                  <Td key={`${theme}_${tokenName}`}>
                                    <div className={`pf-v6-l-flex pf-m-space-items-sm`}>
                                      {hasValue && isColorRegex.test(val) && (
                                        <div
                                          key={`${theme}_${tokenName}_swatch`}
                                          className="pf-v6-l-flex pf-m-column pf-m-align-self-center"
                                        >
                                          <span className="ws-token-swatch" style={{ backgroundColor: val }} />
                                        </div>
                                      )}
                                      <div className="pf-v6-l-flex pf-m-column pf-m-align-self-center">
                                        {hasValue ? val : '-'}
                                      </div>
                                    </div>
                                  </Td>
                                );
                              })}
                              <Td>{description}</Td>
                            </Tr>
                            {hasReferences && isTokenExpanded(tokenName) && (
                              <Tr isExpanded>
                                <Td />
                                <Td />
                                <Td />
                                {themeKeys.map((theme) => {
                                  return (
                                    <Td
                                      key={`${tokenName}-${theme}-token-chain`}
                                      noPadding
                                      dataLabel="Details"
                                      colSpan={1}
                                    >
                                      {themesDataObj.hasOwnProperty(theme) && (
                                        <ExpandableRowContent>
                                          {showTokenChain(themesDataObj[theme])}
                                        </ExpandableRowContent>
                                      )}
                                    </Td>
                                  );
                                })}
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
