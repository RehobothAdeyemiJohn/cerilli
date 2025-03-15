
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase';
import { useAuth } from '@/context/AuthContext';

type DefectFiltersProps = {
  onFilterChange: (filters: {
    status?: string;
    dealerId?: string;
    search?: string;
  }) => void;
};

const DefectFilters = ({ onFilterChange }: DefectFiltersProps) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedDealer, setSelectedDealer] = useState<string>('');

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin,
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({
      status: value || undefined,
      dealerId: selectedDealer || undefined,
      search: search || undefined
    });
  };

  const handleDealerChange = (value: string) => {
    setSelectedDealer(value);
    onFilterChange({
      status: status || undefined,
      dealerId: value || undefined,
      search: search || undefined
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      status: status || undefined,
      dealerId: selectedDealer || undefined,
      search: search || undefined
    });
  };

  const clearFilters = () => {
    setStatus('');
    setSelectedDealer('');
    setSearch('');
    onFilterChange({});
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-white rounded-md border">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Cerca per numero pratica o descrizione"
            value={search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>
        <Button type="submit" variant="default" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tutti gli stati" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutti gli stati</SelectItem>
            <SelectItem value="Aperta">Aperta</SelectItem>
            <SelectItem value="Approvata">Approvata</SelectItem>
            <SelectItem value="Approvata Parzialmente">Approvata Parzialmente</SelectItem>
            <SelectItem value="Respinta">Respinta</SelectItem>
          </SelectContent>
        </Select>

        {isAdmin && (
          <Select value={selectedDealer} onValueChange={handleDealerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tutti i dealer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tutti i dealer</SelectItem>
              {dealers.map((dealer) => (
                <SelectItem key={dealer.id} value={dealer.id}>
                  {dealer.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {(status || selectedDealer || search) && (
        <Button 
          variant="outline" 
          size="sm" 
          className="self-start" 
          onClick={clearFilters}
        >
          <X className="h-4 w-4 mr-2" /> Cancella filtri
        </Button>
      )}
    </div>
  );
};

export default DefectFilters;
