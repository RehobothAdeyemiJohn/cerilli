
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
  isLicensable: boolean | null;
  hasProforma: boolean | null;
  isPaid: boolean | null;
  isInvoiced: boolean | null;
  hasConformity: boolean | null;
  dealerId: string | null;
  model: string | null;
}

export const useOrderFilters = () => {
  const [filters, setFilters] = useState<OrderFilters>({
    searchText: '',
    dateRange: undefined,
    models: [],
    dealers: [],
    status: [],
    isLicensable: null,
    hasProforma: null,
    isPaid: null,
    isInvoiced: null,
    hasConformity: null,
    dealerId: null,
    model: null
  });

  const [showFilters, setShowFilters] = useState(false);

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
      status: [],
      isLicensable: null,
      hasProforma: null,
      isPaid: null,
      isInvoiced: null,
      hasConformity: null,
      dealerId: null,
      model: null
    });
  }, []);

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== null && 
    value !== '' && 
    !(Array.isArray(value) && value.length === 0) && 
    value !== undefined
  ).length;

  return {
    filters,
    handleFilterChange,
    resetFilters,
    showFilters,
    setShowFilters,
    activeFiltersCount
  };
};
