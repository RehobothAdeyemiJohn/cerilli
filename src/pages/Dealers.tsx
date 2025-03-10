
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DealerList from '@/components/dealers/DealerList';
import DealerFormDialog from '@/components/dealers/DealerFormDialog';
import { useToast } from '@/components/ui/use-toast';

const Dealers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const { toast } = useToast();

  const handleDealerCreated = () => {
    // Force refresh of dealer list
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestione Dealers</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Dealer
        </Button>
      </div>

      <DealerList key={refresh} />
      
      <DealerFormDialog 
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleDealerCreated}
      />
    </div>
  );
};

export default Dealers;
