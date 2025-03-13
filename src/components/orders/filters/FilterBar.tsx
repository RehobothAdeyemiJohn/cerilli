
import React from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  onRefresh: () => void;
}

const FilterBar = ({ showFilters, setShowFilters, activeFiltersCount, onRefresh }: FilterBarProps) => {
  return (
    <div className="flex items-center space-x-2 mt-4 md:mt-0">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowFilters(!showFilters)}
        className="relative"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filtri
        {activeFiltersCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
            {activeFiltersCount}
          </span>
        )}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        title="Ricarica ordini"
      >
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FilterBar;
