
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDealerStockValue } from '@/hooks/useDealerStockValue';

interface DealerStockCountCardProps {
  dealerName?: string;
  darkMode?: boolean;
}

const DealerStockCountCard: React.FC<DealerStockCountCardProps> = ({ 
  dealerName = 'CMC',
  darkMode = false 
}) => {
  const { stockCount, isLoading } = useDealerStockValue(dealerName);
  
  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className={darkMode ? 'text-white' : ''}>Auto a Stock {dealerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className={darkMode ? 'text-white' : ''}>Auto a Stock {dealerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="bg-green-100 p-3 rounded-full mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold">{stockCount}</p>
            <p className="text-sm text-gray-500">Veicoli</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DealerStockCountCard;
