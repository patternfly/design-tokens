import React, { useMemo } from 'react';
import { SearchInput, Toolbar, ToolbarItem, ToolbarContent, capitalize } from '@patternfly/react-core';
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

// eslint-disable-next-line camelcase
import global_spacer_md from '@patternfly/react-tokens/dist/esm/global_spacer_md';
import LevelUpAltIcon from '@patternfly/react-icons/dist/esm/icons/level-up-alt-icon';

// Used to combine data grouped by theme under each token name
const combineObjects = (objectsArr) => {
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
  Object.entries(objectsArr).forEach(([key, value]) => {
    addToCombined(value, key);
  });

  return combined;
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

export const TokensTable = ({ tokenJson, formatThemeText = capitalize }) => {
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
  const combinedTokens = combineObjects(tokensByTheme);
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
          <Table variant="compact">
            <Thead>
              <Tr>
                <Th></Th>
                <Th>Name</Th>
                {themeKeys.map((theme) => (
                  <Th key={theme}>{`${formatThemeText(theme)} Theme`}</Th>
                ))}
                <Th>Description</Th>
              </Tr>
            </Thead>
            {Object.entries(combinedTokens).map(([tokenName, themesDataObj], rowIndex) => {
              const searchTerm = searchValue.toLowerCase();
              if (tokenName === 'default') {
                return undefined;
              } else if (
                searchValue !== '' &&
                !(
                  tokenName.toLowerCase().includes(searchTerm) ||
                  themesDataObj.some(
                    (theme) =>
                      theme?.value?.toString().toLowerCase().includes(searchTerm) ||
                      theme?.description?.toLowerCase().includes(searchTerm)
                  )
                )
              ) {
                return undefined;
              } else {
                const themesDataArr = Object.entries(themesDataObj);
                const isResolved = themesDataArr.every(
                  ([_themeName, themeTokenData]) => themeTokenData.references == undefined
                );
                // Tokens share a description across themes
                const description = themesDataArr.find(([_themeName, themeTokenData]) => themeTokenData.description);
                return (
                  <Tbody key={`row-${tokenName}`} isExpanded={isTokenExpanded(tokenName)}>
                    <Tr>
                      <Td
                        expand={
                          !isResolved
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
                        {description && <div>{description[1].description}</div>}
                      </Td>
                      {themeKeys.map((theme) => (
                        <Td key={`${theme}_${tokenName}`}>{tokensByTheme[theme][tokenName]?.value ?? '-'}</Td>
                      ))}
                    </Tr>
                    {!isResolved && (
                      <Tr isExpanded={isTokenExpanded(tokenName)}>
                        <Td />
                        <Td />
                        {themesDataArr.map(([themeName, themeTokenData]) => (
                          <Td key={`${tokenName}-${themeName}-token-chain`} noPadding dataLabel="Details" colSpan={1}>
                            <ExpandableRowContent>{showTokenChain(themeTokenData)}</ExpandableRowContent>
                          </Td>
                        ))}
                      </Tr>
                    )}
                  </Tbody>
                );
              }
            })}
          </Table>
        </InnerScrollContainer>
      </OuterScrollContainer>
    </React.Fragment>
  );
};
