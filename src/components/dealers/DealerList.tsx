
import React, { useState } from 'react';
import { Edit, Trash, Users } from 'lucide-react';
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

const DealerList = () => {
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isVendorsOpen, setIsVendorsOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      // TODO: Implement delete dealer API call
      setDealers(dealers.filter(dealer => dealer.id !== id));
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Azienda</TableHead>
              <TableHead>Indirizzo</TableHead>
              <TableHead>Città</TableHead>
              <TableHead>Provincia</TableHead>
              <TableHead>CAP</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dealers.map((dealer) => (
              <TableRow key={dealer.id}>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <DealerFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        dealer={selectedDealer}
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
