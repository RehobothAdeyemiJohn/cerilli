
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface QuotesHeaderProps {
  setSelectedVehicleId: (id: string | null) => void;
  setCreateDialogOpen: (open: boolean) => void;
  vehicles: any[];
}

const QuotesHeader: React.FC<QuotesHeaderProps> = ({
  setSelectedVehicleId,
  setCreateDialogOpen,
  vehicles
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h1 className="text-2xl font-bold">Preventivi</h1>
      <div className="mt-4 md:mt-0">
        <Button 
          onClick={() => {
            if (vehicles.length > 0) {
              setSelectedVehicleId(vehicles[0].id);
              setCreateDialogOpen(true);
            } else {
              toast({
                title: "Errore",
                description: "Non ci sono veicoli disponibili per creare un preventivo",
                variant: "destructive",
              });
            }
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crea Nuovo Preventivo
        </Button>
      </div>
    </div>
  );
};

export default QuotesHeader;
