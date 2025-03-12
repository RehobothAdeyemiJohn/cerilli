
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DealerList from '@/components/dealers/DealerList';
import DealerFormDialog from '@/components/dealers/DealerFormDialog';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

const Dealers = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';

  const handleDealerCreated = () => {
    // Invalidate the dealers query to refresh the list
    queryClient.invalidateQueries({ queryKey: ['dealers'] });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Gestione Dealers
        </h1>
        {!isDealer && (
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Dealer
          </Button>
        )}
      </div>

      <DealerList dealerId={isDealer ? user?.dealerId : undefined} />
      
      {!isDealer && (
        <DealerFormDialog 
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSuccess={handleDealerCreated}
        />
      )}
    </div>
  );
};

export default Dealers;
