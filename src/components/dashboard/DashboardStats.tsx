
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import { StatCard } from './StatCard';
import { Car, Users, FileText, ShoppingCart } from 'lucide-react';

export const DashboardStats = () => {
  // Query per il conteggio dei veicoli
  const { data: vehiclesCount = 0, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehiclesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching vehicles count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  // Query per il conteggio dei concessionari
  const { data: dealersCount = 0, isLoading: loadingDealers } = useQuery({
    queryKey: ['dealersCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('dealers')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching dealers count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  // Query per il conteggio dei preventivi
  const { data: quotesCount = 0, isLoading: loadingQuotes } = useQuery({
    queryKey: ['quotesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching quotes count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  // Query per il conteggio degli ordini
  const { data: ordersCount = 0, isLoading: loadingOrders } = useQuery({
    queryKey: ['ordersCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching orders count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  const isLoading = loadingVehicles || loadingDealers || loadingQuotes || loadingOrders;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Veicoli"
        value={vehiclesCount}
        description="Totale veicoli disponibili"
        icon={Car}
        loading={loadingVehicles}
      />
      <StatCard
        title="Concessionari"
        value={dealersCount}
        description="Concessionari attivi"
        icon={Users}
        loading={loadingDealers}
      />
      <StatCard
        title="Preventivi"
        value={quotesCount}
        description="Preventivi totali"
        icon={FileText}
        loading={loadingQuotes}
      />
      <StatCard
        title="Ordini"
        value={ordersCount}
        description="Ordini totali"
        icon={ShoppingCart}
        loading={loadingOrders}
      />
    </div>
  );
};

export default DashboardStats;
