import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface QuotesFiltersProps {
  activeStatus?: string;
  status?: string;
  onStatusChange?: (value: string) => void;
  selectedDealer?: string;
  dealerId?: string;
  onDealerChange?: (value: string) => void;
  searchText?: string;
  onSearchChange?: (value: string) => void;
  date?: Date | null;
  onDateChange?: (date: Date | null) => void;
  sortOption?: string;
  onSortChange?: (value: string) => void;
  counts?: any;
  
  searchQuery?: string;
  setSearchQuery?: (value: string) => void;
  filterModel?: string;
  setFilterModel?: (value: string) => void;
  filterDealer?: string;
  setFilterDealer?: (value: string) => void;
  models?: any[];
  dealers?: any[];
}

const QuotesFilters: React.FC<QuotesFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  filterModel,
  setFilterModel,
  filterDealer,
  setFilterDealer,
  models = [],
  dealers = [],
  
  activeStatus,
  status,
  onStatusChange,
  selectedDealer,
  dealerId,
  onDealerChange,
  searchText,
  onSearchChange,
  date,
  onDateChange,
  sortOption,
  onSortChange,
  counts
}) => {
  const effectiveStatus = activeStatus || status || '';
  const handleStatusChange = (value: string) => {
    if (onStatusChange) onStatusChange(value);
  };
  
  const effectiveSearchQuery = searchText || searchQuery || '';
  const handleSearchChange = (value: string) => {
    if (onSearchChange) onSearchChange(value);
    if (setSearchQuery) setSearchQuery(value);
  };
  
  const effectiveFilterDealer = selectedDealer || dealerId || filterDealer || '';
  const handleDealerChange = (value: string) => {
    if (onDealerChange) onDealerChange(value);
    if (setFilterDealer) setFilterDealer(value);
  };
  
  return (
    <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Cerca per cliente o veicolo"
          value={effectiveSearchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-xs"
        />
      </div>
      
      {models && models.length > 0 && (
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex-1">
            <Select value={filterModel || ''} onValueChange={setFilterModel || (() => {})}>
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
      )}
      
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex-1">
          <Select value={effectiveFilterDealer} onValueChange={handleDealerChange}>
            <SelectTrigger>
              <SelectValue placeholder="Filtra per dealer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i dealer</SelectItem>
              {dealers && dealers.map(dealer => (
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
