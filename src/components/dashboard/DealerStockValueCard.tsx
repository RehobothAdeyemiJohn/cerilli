
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDealerStockValue } from '@/hooks/useDealerStockValue';
import { formatCurrency } from '@/lib/utils';

interface DealerStockValueCardProps {
  dealerName?: string;
  darkMode?: boolean;
}

const DealerStockValueCard: React.FC<DealerStockValueCardProps> = ({ 
  dealerName = 'CMC',
  darkMode = false 
}) => {
  const { dealerPlafond, stockValue, nuovoPlafond, isLoading } = useDealerStockValue(dealerName);
  
  const usedPercentage = dealerPlafond > 0 ? Math.min(100, (stockValue / dealerPlafond) * 100) : 0;
  
  const getStatusColor = () => {
    if (nuovoPlafond <= 50000) return 'text-red-600';
    if (usedPercentage >= 70) return 'text-orange-500';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className={darkMode ? 'text-white' : ''}>Plafond {dealerName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className={darkMode ? 'text-white' : ''}>Plafond {dealerName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Plafond Totale</h3>
              <p className="text-2xl font-bold">{formatCurrency(dealerPlafond)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Valore Stock</h3>
              <p className="text-2xl font-bold">{formatCurrency(stockValue)}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Plafond Disponibile</h3>
            <p className={`text-2xl font-bold ${getStatusColor()}`}>
              {formatCurrency(nuovoPlafond)}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 dark:bg-gray-700">
              <div 
                className={`h-2.5 rounded-full ${nuovoPlafond <= 50000 ? 'bg-red-600' : usedPercentage >= 70 ? 'bg-orange-500' : 'bg-green-600'}`} 
                style={{ width: `${usedPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {usedPercentage.toFixed(1)}% utilizzato
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default DealerStockValueCard;
