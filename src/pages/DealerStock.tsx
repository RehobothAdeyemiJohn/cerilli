
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

const DealerStock = () => {
  // Fetch all vehicles from Supabase
  const { 
    data: vehicles = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehiclesApi.getAll,
    staleTime: 0,
  });
  
  // Filter vehicles with location "Stock Dealer"
  const dealerStockVehicles = vehicles.filter(v => v.location === 'Stock Dealer');
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Stock Dealer</h1>
      </div>
      
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veicolo</TableHead>
                <TableHead>Telaio</TableHead>
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
                    Caricamento veicoli...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-red-500">
                    Errore durante il caricamento dei veicoli.
                  </TableCell>
                </TableRow>
              ) : dealerStockVehicles.length > 0 ? (
                dealerStockVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell>
                      {vehicle.model} {vehicle.trim || ''}
                    </TableCell>
                    <TableCell>
                      {vehicle.telaio || '-'}
                    </TableCell>
                    <TableCell>
                      {vehicle.reservedBy || '-'}
                    </TableCell>
                    <TableCell>
                      {vehicle.reservationTimestamp ? new Date(vehicle.reservationTimestamp).toLocaleDateString('it-IT') : '-'}
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
                    Nessun veicolo trovato
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

export default DealerStock;
