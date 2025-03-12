
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface QuotesHeaderProps {
  handleOpenCreateQuoteDialog: (vehicleId?: string) => void;
}

const QuotesHeader: React.FC<QuotesHeaderProps> = ({
  handleOpenCreateQuoteDialog
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <h1 className="text-2xl font-bold">Preventivi</h1>
      <div className="mt-4 md:mt-0">
        <Button 
          onClick={() => handleOpenCreateQuoteDialog()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Crea Nuovo Preventivo
        </Button>
      </div>
    </div>
  );
};

export default QuotesHeader;
