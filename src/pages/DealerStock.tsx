
import React from 'react';
import { useNavigate } from 'react-router-dom';
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
import { FileText, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DealerStock = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  
  // Filter vehicles with location "Stock Dealer" AND (if dealer) only show those reserved by this dealer
  const dealerStockVehicles = vehicles.filter(v => {
    // First filter by location
    if (v.location !== 'Stock Dealer') return false;
    
    // If user is admin, show all dealer stock vehicles
    if (user?.type === 'admin') return true;
    
    // If user is dealer or vendor, only show vehicles reserved by this dealer
    return v.reservedBy === user?.dealerName;
  });
  
  const handleCreateQuote = (vehicle: Vehicle) => {
    // Navigate to quotes page with the selected vehicle info
    navigate('/quotes', { 
      state: { 
        fromInventory: true,
        vehicleId: vehicle.id 
      } 
    });
  };
  
  const handleViewVehicle = (vehicleId: string) => {
    // Open vehicle details dialog logic would go here
    // For now, we'll just navigate to the inventory with a filter
    navigate(`/inventory?vehicleId=${vehicleId}`);
  };
  
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleViewVehicle(vehicle.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizza
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8"
                          onClick={() => handleCreateQuote(vehicle)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Preventivo
                        </Button>
                      </div>
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
