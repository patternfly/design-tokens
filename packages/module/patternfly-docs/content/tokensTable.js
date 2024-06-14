import React from 'react';
import { SearchInput, Toolbar, ToolbarItem, ToolbarContent } from '@patternfly/react-core';
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

import * as defaultTokens from './all-tokens-default.json';
import * as darkTokens from './all-tokens-dark.json';

const getTokenChain = (tokenData) => {
  let tokenChain = [];
  let referenceToken = tokenData?.references?.[0];
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

const showTokenChain = (tokenData) => {
  const tokenChain = getTokenChain(tokenData);

  return (
    <div>
      {tokenChain.map((nextValue, index) => (
        <div
          key={index}
          style={{
            padding: `4px 0 4px calc(${global_spacer_md.value} * ${index + 4})`
          }}
        >
          <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
          <span style={{ paddingLeft: '16px' }}>{nextValue}</span>
        </div>
      ))}
    </div>
  );
};

export const TokensTable = () => {
  // const scssVariables = Object.keys(scssAsJson);
  const tokens = Object.entries(defaultTokens);
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
                <Th>Value</Th>
                <Th>Description</Th>
              </Tr>
            </Thead>
            {tokens.map(([tokenName, tokenData], rowIndex) => {
              if (tokenName === 'default') {
                return undefined;
              } else if (
                searchValue !== '' &&
                !(
                  tokenName.includes(searchValue) ||
                  tokenData?.description?.includes(searchValue) ||
                  tokenData?.value?.toString().includes(searchValue)
                )
              ) {
                return undefined;
              } else {
                const isResolved = tokenData.references == undefined;
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
                      <Td>{tokenName}</Td>
                      <Td>{tokenData.value}</Td>
                      <Td>{tokenData.description ?? ''}</Td>
                    </Tr>
                    {!isResolved && (
                      <Tr isExpanded={isTokenExpanded(tokenName)}>
                        <Td />
                        <Td noPadding dataLabel="Details" colSpan={2}>
                          <ExpandableRowContent>{showTokenChain(tokenData)}</ExpandableRowContent>
                        </Td>
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
