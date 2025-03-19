
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { dealersApi } from '@/api/supabase/dealersApi';
import { Dealer } from '@/types';
import FormDialog from './DealerFormDialog';
import VendorsDialog from './VendorsDialog';
import { useAuth } from '@/context/AuthContext';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DealerListProps {
  dealerId?: string;
}

const DealerList: React.FC<DealerListProps> = ({ dealerId }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.type === 'admin';
  
  const { data: dealers = [], isLoading, error } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });
  
  const updateMutation = useMutation({
    mutationFn: (dealer: Dealer) => {
      const { id, ...updates } = dealer;
      return dealersApi.update(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      toast({
        title: "Dealer Aggiornato",
        description: "Il dealer è stato aggiornato con successo.",
      });
      setIsEditDialogOpen(false);
      setSelectedDealer(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante l'aggiornamento del dealer: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dealersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealers'] });
      toast({
        title: "Dealer Eliminato",
        description: "Il dealer è stato eliminato con successo.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: `Si è verificato un errore durante l'eliminazione del dealer: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleEdit = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = (dealer: Dealer) => {
    if (dealerId === dealer.id) {
      toast({
        title: "Errore",
        description: "Non puoi eliminare il tuo account dealer.",
        variant: "destructive",
      });
      return;
    }
    
    if (window.confirm("Sei sicuro di voler eliminare questo dealer?")) {
      deleteMutation.mutate(dealer.id);
    }
  };
  
  const handleVendors = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setIsVendorsOpen(true);
  };
  
  const renderActions = (dealer: Dealer) => {
    const isOwnDealer = dealerId === dealer.id;
    
    return (
      <div className="flex justify-end gap-2">
        {(isAdmin || isOwnDealer) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(dealer)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        
        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDelete(dealer)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleVendors(dealer)}
          >
            <Users className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return <div>Caricamento in corso...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Errore!</strong>
        <span className="block sm:inline">Si è verificato un errore durante il caricamento dei dealer.</span>
      </div>
    );
  }
  
  return (
    <>
      <Table>
        <TableCaption>Lista di tutti i dealers.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Logo</TableHead>
            <TableHead>Nome Azienda</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contatto</TableHead>
            <TableHead>Indirizzo</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dealers.map((dealer) => (
            <TableRow key={dealer.id}>
              <TableCell>
                {dealer.logo ? (
                  <img src={dealer.logo} alt={dealer.companyName} className="h-8 w-auto" />
                ) : (
                  <span>N/A</span>
                )}
              </TableCell>
              <TableCell>{dealer.companyName}</TableCell>
              <TableCell>{dealer.email}</TableCell>
              <TableCell>{dealer.contactName}</TableCell>
              <TableCell>{dealer.address}, {dealer.city}, {dealer.province}, {dealer.zipCode}</TableCell>
              <TableCell className="text-right">{renderActions(dealer)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {selectedDealer && (
        <FormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          dealer={selectedDealer}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['dealers'] })}
        />
      )}
      
      {selectedDealer && (
        <VendorsDialog
          open={isVendorsOpen}
          onOpenChange={() => setIsVendorsOpen(false)}
          dealer={selectedDealer}
        />
      )}
    </>
  );
};

export default DealerList;
