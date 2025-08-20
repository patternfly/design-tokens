import React from 'react';
import {
  MenuToggle,
  SearchInput,
  Select,
  SelectList,
  SelectOption,
  Toolbar,
  ToolbarItem,
  ToolbarContent,
  capitalize
} from '@patternfly/react-core';
import FilterIcon from '@patternfly/react-icons/dist/esm/icons/filter-icon';

const TokensToolbarSelect = ({ selectedCategory, setSelectedCategory, categories }) => {
  const [isSelectOpen, setIsSelectOpen] = React.useState(false);
  const handleSelect = (_e, category) => {
    if (!(selectedCategory === category)) {
      setSelectedCategory(category);
    }
    setIsSelectOpen(!isSelectOpen);
  };

  const SelectToggle = (toggleRef) => (
    <MenuToggle
      icon={<FilterIcon />}
      ref={toggleRef}
      onClick={() => setIsSelectOpen(!isSelectOpen)}
      isExpanded={isSelectOpen}
    >
      {capitalize(selectedCategory)} tokens
    </MenuToggle>
  );

  return (
    <Select
      aria-label="Select Input"
      role="menu"
      toggle={SelectToggle}
      isOpen={isSelectOpen}
      onOpenChange={(isOpen) => setIsSelectOpen(isOpen)}
      onSelect={handleSelect}
    >
      <SelectList>
        {categories.map((category, idx) => (
          <SelectOption key={idx} value={category} isSelected={selectedCategory === category}>
            {capitalize(category)} tokens
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
};

export const TokensToolbar = ({
  selectedCategory,
  setSelectedCategory,
  searchValue,
  setSearchValue,
  resultsCount,
  categories
}) => {
  return (
    <Toolbar>
      <ToolbarContent>
        <ToolbarItem variant="search-filter">
          <SearchInput
            aria-label="Search all tokens"
            placeholder="Search all tokens"
            value={searchValue}
            onChange={(_event, value) => setSearchValue(value)}
            onClear={() => setSearchValue('')}
            resultsCount={resultsCount}
          />
        </ToolbarItem>

        <ToolbarItem>
          <TokensToolbarSelect
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </ToolbarItem>
      </ToolbarContent>
    </Toolbar>
  );
};
