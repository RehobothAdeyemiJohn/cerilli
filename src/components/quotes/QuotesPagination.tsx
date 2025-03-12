
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface QuotesPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  handlePrevPage: () => void;
  handleNextPage: () => void;
  setItemsPerPage: (value: number) => void;
}

const QuotesPagination: React.FC<QuotesPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  handlePrevPage,
  handleNextPage,
  setItemsPerPage
}) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        Mostrando pagina {currentPage} di {totalPages || 1}
      </div>
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm">
          Pagina {currentPage}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Select 
          value={itemsPerPage.toString()} 
          onValueChange={(value) => setItemsPerPage(Number(value))}
        >
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Righe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 righe</SelectItem>
            <SelectItem value="20">20 righe</SelectItem>
            <SelectItem value="50">50 righe</SelectItem>
            <SelectItem value="100">100 righe</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuotesPagination;
