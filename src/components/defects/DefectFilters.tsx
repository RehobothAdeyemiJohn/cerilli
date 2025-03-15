
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
import { Search, X, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dealersApi } from '@/api/supabase';
import { useAuth } from '@/context/AuthContext';
import DateRangePicker from '@/components/dashboard/DateRangePicker';
import { subDays, subMonths, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

type DefectFiltersProps = {
  onFilterChange: (filters: {
    status?: string;
    dealerId?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => void;
};

const DefectFilters = ({ onFilterChange }: DefectFiltersProps) => {
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  const { data: dealers = [] } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    enabled: isAdmin,
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    applyFilters({
      status: value !== 'all' ? value : undefined,
      dealerId: selectedDealer !== 'all' ? selectedDealer : undefined,
      search: search || undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
  };

  const handleDealerChange = (value: string) => {
    setSelectedDealer(value);
    applyFilters({
      status: status !== 'all' ? status : undefined,
      dealerId: value !== 'all' ? value : undefined,
      search: search || undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters({
      status: status !== 'all' ? status : undefined,
      dealerId: selectedDealer !== 'all' ? selectedDealer : undefined,
      search: search || undefined,
      dateFrom: dateRange.from,
      dateTo: dateRange.to
    });
  };

  const applyFilters = (filters: {
    status?: string;
    dealerId?: string;
    search?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => {
    onFilterChange(filters);
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    setSelectedPeriod(''); // Reset the period selector when manually selecting dates
    applyFilters({
      status: status !== 'all' ? status : undefined,
      dealerId: selectedDealer !== 'all' ? selectedDealer : undefined,
      search: search || undefined,
      dateFrom: range.from,
      dateTo: range.to
    });
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    
    let from: Date | undefined = undefined;
    let to: Date | undefined = new Date();
    
    // Calculate date range based on selected period
    switch (value) {
      case 'week':
        from = startOfWeek(new Date());
        break;
      case 'month':
        from = startOfMonth(new Date());
        break;
      case 'year':
        from = startOfYear(new Date());
        break;
      case 'last7':
        from = subDays(new Date(), 7);
        break;
      case 'last30':
        from = subDays(new Date(), 30);
        break;
      case 'last90':
        from = subDays(new Date(), 90);
        break;
      case 'all':
        from = undefined;
        to = undefined;
        break;
    }
    
    setDateRange({ from, to });
    
    applyFilters({
      status: status !== 'all' ? status : undefined,
      dealerId: selectedDealer !== 'all' ? selectedDealer : undefined,
      search: search || undefined,
      dateFrom: from,
      dateTo: to
    });
  };

  const clearFilters = () => {
    setStatus('');
    setSelectedDealer('');
    setSearch('');
    setDateRange({ from: undefined, to: undefined });
    setSelectedPeriod('');
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
            <SelectItem value="all">Tutti gli stati</SelectItem>
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
              <SelectItem value="all">Tutti i dealer</SelectItem>
              {dealers.map((dealer) => (
                <SelectItem key={dealer.id} value={dealer.id}>
                  {dealer.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="w-full md:w-1/2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleziona periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i periodi</SelectItem>
              <SelectItem value="week">Questa settimana</SelectItem>
              <SelectItem value="month">Questo mese</SelectItem>
              <SelectItem value="year">Quest'anno</SelectItem>
              <SelectItem value="last7">Ultimi 7 giorni</SelectItem>
              <SelectItem value="last30">Ultimi 30 giorni</SelectItem>
              <SelectItem value="last90">Ultimi 90 giorni</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/2">
          <DateRangePicker 
            dateRange={dateRange} 
            setDateRange={handleDateRangeChange}
          />
        </div>
      </div>

      {(status || selectedDealer || search || dateRange.from || dateRange.to) && (
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
