
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
import { dealers, deleteDealer, updateDealer } from '@/data/mockData';

const DealerList = () => {
  const [dealersList, setDealersList] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const { toast } = useToast();

  // Load dealers when component mounts
  useEffect(() => {
    setDealersList([...dealers]);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      deleteDealer(id);
      setDealersList(dealersList.filter(dealer => dealer.id !== id));
      toast({
        title: "Dealer eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore durante l'eliminazione",
        variant: "destructive",
      });
    }
  };

  const toggleDealerStatus = (dealer: Dealer) => {
    try {
      const updatedDealer = {
        ...dealer,
        isActive: !dealer.isActive
      };
      updateDealer(updatedDealer);
      
      // Update the dealers list
      setDealersList(dealersList.map(d => 
        d.id === dealer.id ? updatedDealer : d
      ));
      
      toast({
        title: updatedDealer.isActive 
          ? "Dealer attivato con successo" 
          : "Dealer disattivato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore durante l'aggiornamento dello stato",
        variant: "destructive",
      });
    }
  };

  // Function to refresh dealers list
  const refreshDealers = () => {
    setDealersList([...dealers]);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stato</TableHead>
              <TableHead>Azienda</TableHead>
              <TableHead>Indirizzo</TableHead>
              <TableHead>Città</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>CAP</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealersList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nessun dealer presente
                </TableCell>
              </TableRow>
            ) : (
              dealersList.map((dealer) => (
                <TableRow key={dealer.id}>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DealerFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        dealer={selectedDealer}
        onSuccess={refreshDealers}
      />

      <VendorsDialog
        open={isVendorsOpen}
        onOpenChange={setIsVendorsOpen}
        dealer={selectedDealer}
      />
    </>
  );
};

export default DealerList;
