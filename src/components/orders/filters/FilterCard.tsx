
import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import FilterSwitchItem from './FilterSwitchItem';
import FilterModelSelect from './FilterModelSelect';
import FilterSelectItem from './FilterSelectItem';
import { Dealer } from '@/types';

interface FilterCardProps {
  filters: {
    isLicensable: boolean | null;
    hasProforma: boolean | null;
    isPaid: boolean | null;
    isInvoiced: boolean | null;
    hasConformity: boolean | null;
    dealerId: string | null;
    model: string | null;
  };
  updateFilter: (key: string, value: boolean | null | string) => void;
  resetFilters: () => void;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  dealersData: Dealer[];
  uniqueModels: string[];
}

const FilterCard = ({
  filters,
  updateFilter,
  resetFilters,
  setShowFilters,
  activeFiltersCount,
  dealersData,
  uniqueModels
}: FilterCardProps) => {
  return (
    <Card className="mb-6 mt-4 border shadow-sm bg-white">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Filtri</CardTitle>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reimposta filtri
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <FilterSwitchItem 
            label="Targabile" 
            value={filters.isLicensable} 
            onChange={(checked) => updateFilter('isLicensable', checked ? true : null)} 
            description="Veicoli con possibilità di immatricolazione"
          />
          
          <FilterSwitchItem 
            label="Proformata" 
            value={filters.hasProforma} 
            onChange={(checked) => updateFilter('hasProforma', checked ? true : null)} 
            description="Ordini con proforma emessa"
          />
          
          <FilterSwitchItem 
            label="Saldata" 
            value={filters.isPaid} 
            onChange={(checked) => updateFilter('isPaid', checked ? true : null)} 
            description="Ordini completamente pagati"
          />
          
          <FilterSwitchItem 
            label="Fatturata" 
            value={filters.isInvoiced} 
            onChange={(checked) => updateFilter('isInvoiced', checked ? true : null)} 
            description="Ordini con fattura emessa"
          />
          
          <FilterSwitchItem 
            label="Conformità" 
            value={filters.hasConformity} 
            onChange={(checked) => updateFilter('hasConformity', checked ? true : null)} 
            description="Veicoli con certificato di conformità"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FilterModelSelect
            value={filters.model}
            onChange={(value) => updateFilter('model', value)}
            models={uniqueModels}
          />
          
          <FilterSelectItem
            label="Dealer"
            value={filters.dealerId}
            onChange={(value) => updateFilter('dealerId', value)}
            options={dealersData.map(dealer => ({ id: dealer.id, name: dealer.companyName }))}
            placeholder="Seleziona dealer"
          />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-end">
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowFilters(false)}
          className="bg-gray-900 hover:bg-gray-800"
        >
          Applica
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FilterCard;
