
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dealer } from '@/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SlidersHorizontal, RefreshCw, XCircle } from 'lucide-react';

interface FilterSwitchItemProps {
  label: string;
  value: boolean | null;
  onChange: (checked: boolean) => void;
  description?: string;
}

const FilterSwitchItem = ({ label, value, onChange, description }: FilterSwitchItemProps) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium text-gray-700">{label}</Label>
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <Switch 
          checked={value === true}
          onCheckedChange={onChange}
          className="data-[state=checked]:bg-primary"
        />
      </div>
    </div>
  );
};

interface OrdersFiltersProps {
  isAdmin: boolean;
  filters: {
    isLicensable: boolean | null;
    hasProforma: boolean | null;
    isPaid: boolean | null;
    isInvoiced: boolean | null;
    hasConformity: boolean | null;
    dealerId: string | null;
    model: string | null;
  };
  updateFilter: (key: string, value: boolean | null) => void;
  resetFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFiltersCount: number;
  dealersData: Dealer[];
  uniqueModels: string[];
  onRefresh: () => void;
}

const OrdersFilters = ({
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
}: OrdersFiltersProps) => {
  if (!isAdmin) return null;

  return (
    <div>
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
      
      {showFilters && (
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
              <div>
                <Label className="text-sm font-medium mb-2 block text-gray-700">Modello</Label>
                <Select
                  value={filters.model || "all"}
                  onValueChange={(value) => updateFilter('model', value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full border-gray-300 bg-white">
                    <SelectValue placeholder="Seleziona modello" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i modelli</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-2 block text-gray-700">Dealer</Label>
                <Select
                  value={filters.dealerId || "all"}
                  onValueChange={(value) => updateFilter('dealerId', value === "all" ? null : value)}
                >
                  <SelectTrigger className="w-full border-gray-300 bg-white">
                    <SelectValue placeholder="Seleziona dealer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i dealer</SelectItem>
                    {dealersData.map((dealer: Dealer) => (
                      <SelectItem key={dealer.id} value={dealer.id}>{dealer.companyName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
      )}
    </div>
  );
};

export default OrdersFilters;
