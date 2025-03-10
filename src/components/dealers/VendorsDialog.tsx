
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import VendorFormDialog from './VendorFormDialog';
import { Dealer, Vendor } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { getVendorsByDealerId, deleteVendor } from '@/data/mockData';

interface VendorsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealer: Dealer | null;
}

const VendorsDialog = ({
  open,
  onOpenChange,
  dealer,
}: VendorsDialogProps) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isVendorFormOpen, setIsVendorFormOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const { toast } = useToast();

  // Load vendors when dialog opens or dealer changes
  useEffect(() => {
    if (dealer && open) {
      const dealerVendors = getVendorsByDealerId(dealer.id);
      setVendors(dealerVendors);
    }
  }, [dealer, open]);

  const handleDeleteVendor = async (id: string) => {
    try {
      deleteVendor(id);
      setVendors(vendors.filter(vendor => vendor.id !== id));
      toast({
        title: "Venditore eliminato con successo",
      });
    } catch (error) {
      toast({
        title: "Errore durante l'eliminazione",
        variant: "destructive",
      });
    }
  };

  // Function to refresh vendors list
  const refreshVendors = () => {
    if (dealer) {
      const updatedVendors = getVendorsByDealerId(dealer.id);
      setVendors(updatedVendors);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            Venditori - {dealer?.companyName}
          </DialogTitle>
          <DialogDescription>
            Gestisci i venditori associati a questo dealer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end mb-4">
          <Button onClick={() => {
            setSelectedVendor(null);
            setIsVendorFormOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Venditore
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    Nessun venditore presente
                  </TableCell>
                </TableRow>
              ) : (
                vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(vendor);
                            setIsVendorFormOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteVendor(vendor.id)}
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

        <VendorFormDialog
          open={isVendorFormOpen}
          onOpenChange={setIsVendorFormOpen}
          dealer={dealer}
          vendor={selectedVendor}
          onSuccess={refreshVendors}
        />
      </DialogContent>
    </Dialog>
  );
};

export default VendorsDialog;
