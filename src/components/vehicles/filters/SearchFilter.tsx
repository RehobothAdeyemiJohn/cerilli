
import React from 'react';
import { Search, FilterX } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFilterProps {
  searchText: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
}

const SearchFilter = ({ searchText, onSearchChange, onClearSearch }: SearchFilterProps) => {
  return (
    <div className="relative mb-4">
      <Input
        value={searchText}
        onChange={onSearchChange}
        placeholder="Cerca telaio, modello..."
        className="pr-10"
      />
      {searchText && (
        <button 
          onClick={onClearSearch}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <FilterX className="h-4 w-4" />
        </button>
      )}
      {!searchText && (
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      )}
    </div>
  );
};

export default SearchFilter;
