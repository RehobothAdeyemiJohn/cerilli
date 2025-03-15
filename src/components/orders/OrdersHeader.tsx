
import React from 'react';
import OrdersFilters from '@/components/orders/OrdersFilters';
import { Dealer, OrderFilters } from '@/types';

interface OrdersHeaderProps {
  isAdmin: boolean;
  filters: OrderFilters;
  updateFilter: (key: string, value: boolean | null | string) => void;
  resetFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  dealersData: Dealer[];
  uniqueModels: string[];
  onRefresh: () => void;
}

const OrdersHeader = ({
  isAdmin,
  filters,
  updateFilter,
  resetFilters,
  showFilters,
  setShowFilters,
  activeFiltersCount,
  dealersData,
  uniqueModels,
  onRefresh
}: OrdersHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h1 className="text-2xl font-bold">Ordini</h1>
      
      <OrdersFilters
        isAdmin={isAdmin}
        filters={filters}
        updateFilter={updateFilter}
        resetFilters={resetFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        dealersData={dealersData}
        uniqueModels={uniqueModels}
        onRefresh={onRefresh}
      />
    </div>
  );
};

export default OrdersHeader;
