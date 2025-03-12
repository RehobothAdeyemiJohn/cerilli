import React, { useState, useEffect } from 'react';
import { Edit, Trash, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import DealerFormDialog from './DealerFormDialog';
import VendorsDialog from './VendorsDialog';
import { Dealer } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

interface DealerListProps {
  dealerId?: string;
}

const DealerList = ({ dealerId }: DealerListProps) => {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';

  const { data: dealersList = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
    staleTime: 60000,
  });

  const filteredDealers = dealerId 
    ? dealersList.filter(dealer => dealer.id === dealerId)
    : dealersList;

  const handleDelete = async (id: string) => {
    try {
      await dealersApi.delete(id);
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      toast({
        title: "Dealer eliminato con successo",
      });
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      toast({
        title: "Errore durante l'eliminazione",
        variant: "destructive",
      });
    }
  };

  const toggleDealerStatus = async (dealer: Dealer) => {
    try {
      const newStatus = !dealer.isActive;
      await dealersApi.toggleStatus(dealer.id, newStatus);
      
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      
      toast({
        title: newStatus 
          ? "Dealer attivato con successo" 
          : "Dealer disattivato con successo",
      });
    } catch (error) {
      console.error('Errore durante l\'aggiornamento dello stato:', error);
      toast({
        title: "Errore durante l'aggiornamento dello stato",
        variant: "destructive",
      });
    }
  };

  const refreshDealers = () => {
    queryClient.invalidateQueries({ queryKey: ['dealers'] });
  };

  if (isLoading) {
    return <div className="py-10 text-center">Caricamento dealers...</div>;
  }

  if (isError) {
    return <div className="py-10 text-center text-red-500">Errore nel caricamento dei dealers!</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              {!isDealer && <TableHead>Stato</TableHead>}
              <TableHead>Azienda</TableHead>
              <TableHead>Indirizzo</TableHead>
              <TableHead>Città</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>CAP</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDealers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isDealer ? 6 : 7} className="text-center py-4 text-muted-foreground">
                  Nessun dealer presente
                </TableCell>
              </TableRow>
            ) : (
              filteredDealers.map((dealer) => (
                <TableRow key={dealer.id}>
                  <TableCell>
                    {dealer.logo ? (
                      <img 
                        src={dealer.logo} 
                        alt={`${dealer.companyName} logo`}
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </TableCell>
                  {!isDealer && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleDealerStatus(dealer)}
                        className={`p-0 h-auto ${dealer.isActive ? 'text-green-500' : 'text-red-500'}`}
                        title={dealer.isActive ? 'Attivo - Clicca per disattivare' : 'Inattivo - Clicca per attivare'}
                      >
                        {dealer.isActive ? (
                          <ToggleRight className="h-6 w-6" />
                        ) : (
                          <ToggleLeft className="h-6 w-6" />
                        )}
                      </Button>
                    </TableCell>
                  )}
                  <TableCell>{dealer.companyName}</TableCell>
                  <TableCell>{dealer.address}</TableCell>
                  <TableCell>{dealer.city}</TableCell>
                  <TableCell>{dealer.province}</TableCell>
                  <TableCell>{dealer.zipCode}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDealer(dealer);
                          setIsVendorsOpen(true);
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      {!isDealer && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDealer(dealer);
                              setIsEditOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dealer.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!isDealer && (
        <DealerFormDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          dealer={selectedDealer}
          onSuccess={refreshDealers}
        />
      )}

      <VendorsDialog
        open={isVendorsOpen}
        onOpenChange={setIsVendorsOpen}
        dealer={selectedDealer}
      />
    </>
  );
};

export default DealerList;
