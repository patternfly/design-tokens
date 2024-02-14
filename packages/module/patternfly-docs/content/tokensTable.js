import React from "react";
import {
  SearchInput,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
} from "@patternfly/react-core";
import {
  Table,
  Thead,
  Th,
  Tr,
  Tbody,
  Td,
  ExpandableRowContent,
  OuterScrollContainer,
  InnerScrollContainer,
} from "@patternfly/react-table";

// eslint-disable-next-line camelcase
import global_spacer_md from "@patternfly/react-tokens/dist/esm/global_spacer_md";
import LevelUpAltIcon from "@patternfly/react-icons/dist/esm/icons/level-up-alt-icon";

import * as scssAsJson from "../scssAsJson";

export const TokensTable = () => {
  const scssVariables = Object.keys(scssAsJson);
  const [searchValue, setSearchValue] = React.useState('');
  const [expandedTokens, setExpandedTokens] = React.useState([]);
  const setExpanded = (tokenName, isExpanding = true) =>
    setExpandedTokens((prevExpanded) => {
      const otherExpandedTokens = prevExpanded.filter((n) => n !== tokenName);
      return isExpanding ? [...otherExpandedTokens, tokenName] : otherExpandedTokens;
    });
  const isTokenExpanded = (tokenName) => expandedTokens.includes(tokenName);

  const showTokenChain = (tokenName) => {
    let tokenChain = [];
    let tokenValue = scssAsJson[tokenName];

    while (tokenValue !== undefined) {
      tokenChain = [...tokenChain, tokenValue]
      tokenValue = scssAsJson[tokenValue];
    }

    return (
      <div>
        <div
          className="ws-css-property"
          style={{
            padding: `4px 0 4px calc(${global_spacer_md.value} * ${3})`
          }}>
          <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
          <span style={{ paddingLeft: '16px' }}>
            {tokenName}
          </span>
        </div>
        {tokenChain.map((nextValue, index) => (
          <div
            key={index}
            style={{
              padding: `4px 0 4px calc(${global_spacer_md.value} * ${index + 4})`
            }}
          >
            <LevelUpAltIcon style={{ transform: 'rotate(90deg)' }} />
            <span style={{ paddingLeft: '16px' }}>
              {nextValue}
            </span>
          </div>
        ))}
      </div>
    )
  };

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
              onClear={() => setSearchValue("")}
            />
          </ToolbarItem>
        </ToolbarContent>
      </Toolbar>
      <OuterScrollContainer>
        <InnerScrollContainer>
          <Table variant="compact">
            <Thead>
              <Th></Th>
              <Th>Name</Th>
              <Th>Value</Th>
            </Thead>
            {scssVariables.map((tokenName, rowIndex) => {
              if (tokenName === 'default') {
                return undefined
              } else if (searchValue !== '' && !tokenName.includes(searchValue)) {
                return undefined
              } else {
                const isResolved = scssAsJson[scssAsJson[tokenName]] === undefined;
                return (
                  <Tbody key={`row-${tokenName}`} isExpanded={isTokenExpanded(tokenName)}>
                    <Tr>
                      <Td
                        expand={
                          !isResolved
                            ? {
                              rowIndex,
                              isExpanded: isTokenExpanded(tokenName),
                              onToggle: () =>
                                setExpanded(tokenName, !isTokenExpanded(tokenName)),
                              expandId: `${tokenName}-expandable-toggle`,
                            }
                            : undefined
                        }
                      />
                      <Td>{tokenName}</Td>
                      <Td>{scssAsJson[scssAsJson[tokenName]] === undefined && scssAsJson[tokenName]}</Td>
                    </Tr>
                    {!isResolved && (
                      <Tr isExpanded={isTokenExpanded(tokenName)}>
                        <Td />
                        <Td noPadding dataLabel="Details" colSpan={2}>
                          <ExpandableRowContent>
                            {showTokenChain(scssAsJson[tokenName])}
                          </ExpandableRowContent>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                )
              }
            })}
          </Table>
        </InnerScrollContainer>
      </OuterScrollContainer>
    </React.Fragment>
  )
};
