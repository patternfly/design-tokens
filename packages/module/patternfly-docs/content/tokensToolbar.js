import React from 'react';
import {
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarItem,
  ToolbarContent
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

export const TokensToolbar = ({ selectedCategories, setSelectedCategories, searchValue, setSearchValue }) => {
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);

  return (
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
        <ToolbarItem>
          <Select
            id="select-tokens-category"
            aria-label="Select Input"
            role="menu"
            toggle={(toggleRef) => (
              <MenuToggle
                icon={<FilterIcon />}
                ref={toggleRef}
                onClick={() => setIsSelectOpen(!isSelectOpen)}
                isExpanded={isSelectOpen}
              >
                Category
              </MenuToggle>
            )}
            isOpen={isSelectOpen}
            onOpenChange={(isOpen) => setIsSelectOpen(isOpen)}
            onSelect={(_e, category) => {
              if (selectedCategories.includes(category)) {
                setSelectedCategories(selectedCategories.filter((cat) => cat !== category));
              } else {
                setSelectedCategories([...selectedCategories, category]);
              }
              setIsSelectOpen(!isSelectOpen);
            }}
          >
            <SelectList>
              <SelectOption hasCheckbox key={0} value="colors" isSelected={selectedCategories.includes('colors')}>
                Colors
              </SelectOption>
              <SelectOption hasCheckbox key={1} value="dimension" isSelected={selectedCategories.includes('dimension')}>
                Dimension
              </SelectOption>
              <SelectOption hasCheckbox key={2} value="motion" isSelected={selectedCategories.includes('motion')}>
                Motion
              </SelectOption>
              <SelectOption hasCheckbox key={3} value="palette" isSelected={selectedCategories.includes('palette')}>
                Palette
              </SelectOption>
              <SelectOption hasCheckbox key={4} value="chart" isSelected={selectedCategories.includes('chart')}>
                Chart
              </SelectOption>
            </SelectList>
          </Select>
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
