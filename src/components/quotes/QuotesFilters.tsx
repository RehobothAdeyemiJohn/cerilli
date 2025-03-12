
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface QuotesFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filterModel: string;
  setFilterModel: (value: string) => void;
  filterDealer: string;
  setFilterDealer: (value: string) => void;
  models: any[];
  dealers: any[];
}

const QuotesFilters: React.FC<QuotesFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterModel,
  setFilterModel,
  filterDealer,
  setFilterDealer,
  models,
  dealers
}) => {
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cerca per cliente o veicolo"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex-1">
          <Select value={filterModel} onValueChange={setFilterModel}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per modello" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i modelli</SelectItem>
              {models.map(model => (
                <SelectItem key={model.id} value={model.name}>{model.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex-1">
          <Select value={filterDealer} onValueChange={setFilterDealer}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per dealer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i dealer</SelectItem>
              {dealers.map(dealer => (
                <SelectItem key={dealer.id} value={dealer.id}>{dealer.companyName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default QuotesFilters;
