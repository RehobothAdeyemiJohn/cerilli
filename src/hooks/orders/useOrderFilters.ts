
import { useState } from 'react';

export const useOrderFilters = () => {
  const [filters, setFilters] = useState({
    isLicensable: null as boolean | null,
    hasProforma: null as boolean | null,
    isPaid: null as boolean | null,
    isInvoiced: null as boolean | null,
    hasConformity: null as boolean | null,
    dealerId: null as string | null,
    model: null as string | null,
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: string, value: boolean | null | string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetFilters = () => {
    setFilters({
      isLicensable: null,
      hasProforma: null,
      isPaid: null,
      isInvoiced: null,
      hasConformity: null,
      dealerId: null,
      model: null,
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== null).length;

  return {
    filters,
    showFilters,
    setShowFilters,
    updateFilter,
    resetFilters,
    activeFiltersCount
  };
};
