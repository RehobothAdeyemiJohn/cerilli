
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import StatCard from './StatCard';
import { useAuth } from '@/context/AuthContext';
import { Car, Users, FileText, ShoppingCart } from 'lucide-react';

export const DashboardStats = () => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;
  
  // Query per il conteggio dei veicoli
  const { data: vehiclesCount = 0, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehiclesCount', dealerId],
    queryFn: async () => {
      let query = supabase.from('vehicles').select('*', { count: 'exact', head: true });
      
      // Filter by dealer if in dealer mode
      if (isDealer && dealerId) {
        query = query.eq('reservedby', dealerId);
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching vehicles count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  // Query per il conteggio dei concessionari (solo per admin)
  const { data: dealersCount = 0, isLoading: loadingDealers } = useQuery({
    queryKey: ['dealersCount'],
    queryFn: async () => {
      if (isDealer) return 1; // Se è dealer, mostra solo 1 (se stesso)
      
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
    queryKey: ['quotesCount', dealerId],
    queryFn: async () => {
      let query = supabase.from('quotes').select('*', { count: 'exact', head: true });
      
      // Filter by dealer if in dealer mode
      if (isDealer && dealerId) {
        query = query.eq('dealerid', dealerId);
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching quotes count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  // Query per il conteggio degli ordini
  const { data: ordersCount = 0, isLoading: loadingOrders } = useQuery({
    queryKey: ['ordersCount', dealerId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*', { count: 'exact', head: true });
      
      // Filter by dealer if in dealer mode
      if (isDealer && dealerId) {
        query = query.eq('dealerid', dealerId);
      }
      
      const { count, error } = await query;
      
      if (error) {
        console.error('Error fetching orders count:', error);
        throw error;
      }
      return count || 0;
    }
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Veicoli"
        value={vehiclesCount}
        description={isDealer ? "Veicoli riservati" : "Totale veicoli disponibili"}
        icon={Car}
        loading={loadingVehicles}
        color="bg-green-100 text-green-600"
      />
      <StatCard
        title="Concessionari"
        value={dealersCount}
        description="Concessionari attivi"
        icon={Users}
        loading={loadingDealers}
        color="bg-purple-100 text-purple-600"
      />
      <StatCard
        title="Preventivi"
        value={quotesCount}
        description={isDealer ? "I tuoi preventivi" : "Preventivi totali"}
        icon={FileText}
        loading={loadingQuotes}
        color="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Ordini"
        value={ordersCount}
        description={isDealer ? "I tuoi ordini" : "Ordini totali"}
        icon={ShoppingCart}
        loading={loadingOrders}
        color="bg-pink-100 text-pink-600"
      />
    </div>
  );
};

export default DashboardStats;
