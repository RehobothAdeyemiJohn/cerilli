
import { useState, useCallback } from 'react';

export interface OrderFilters {
  searchText?: string;
  dateRange?: {
    from: Date | undefined;
    to: Date | undefined;
  };
  models?: string[];
  dealers?: string[];
  status?: string[];
}

export const useOrderFilters = () => {
  const [filters, setFilters] = useState<OrderFilters>({
    searchText: '',
    dateRange: undefined,
    models: [],
    dealers: [],
    status: []
  });

  const handleFilterChange = useCallback((filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchText: '',
      dateRange: undefined,
      models: [],
      dealers: [],
      status: []
    });
  }, []);

  return {
    filters,
    handleFilterChange,
    resetFilters
  };
};
