
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { Vehicle } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const Deliveries = () => {
  // Fetch all vehicles from Supabase
  const { 
    data: vehicles = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    staleTime: 0, // Set to 0 to always consider data stale
  });
  
  // Filter vehicles with status "delivered"
  const deliveredVehicles = vehicles.filter(v => v.status === 'delivered');
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('it-IT');
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Consegne</h1>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veicolo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Concessionario</TableHead>
                <TableHead>Data Consegna</TableHead>
                <TableHead>Prezzo</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Caricamento consegne...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-red-500">
                    Errore durante il caricamento delle consegne.
                  </TableCell>
                </TableRow>
              ) : deliveredVehicles.length > 0 ? (
                deliveredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      {vehicle.model} {vehicle.trim || ''}
                    </TableCell>
                    <TableCell>
                      {vehicle.reservedBy || '-'}
                    </TableCell>
                    <TableCell>
                      {vehicle.reservedBy || '-'}
                    </TableCell>
                    <TableCell>
                      {formatDate(vehicle.reservationTimestamp)}
                    </TableCell>
                    <TableCell>
                      € {vehicle.price?.toLocaleString('it-IT') || '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8"
                      >
                        Visualizza
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                    Nessuna consegna trovata
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;
