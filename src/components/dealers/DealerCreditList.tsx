
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dealersApi } from '@/api/supabase/dealersApi';
import { formatCurrency } from '@/lib/utils';

interface DealerCreditListProps {
  darkMode?: boolean;
}

const DealerCreditList: React.FC<DealerCreditListProps> = ({ darkMode = false }) => {
  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });

  if (isLoading) {
    return (
      <Card className={`overflow-hidden ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
        <CardHeader>
          <CardTitle className={darkMode ? 'text-white' : ''}>Plafond Concessionari</CardTitle>
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
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
      <CardHeader>
        <CardTitle className={darkMode ? 'text-white' : ''}>Plafond Concessionari</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {dealers.map((dealer) => {
            const creditLimit = dealer.creditLimit || 0;
            const esposizione = dealer.esposizione || 0;
            const nuovoPlafond = dealer.nuovoPlafond;
            
            // Calcolo della percentuale disponibile (non utilizzata)
            const availablePercentage = creditLimit > 0 ? Math.min(100, Math.round(((creditLimit - esposizione) / creditLimit) * 100)) : 0;
            
            return (
              <div key={dealer.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dealer.companyName}</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatCurrency(nuovoPlafond || creditLimit)} / {formatCurrency(creditLimit)}
                  </span>
                </div>
                <Progress value={availablePercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Esposizione: {formatCurrency(esposizione)}</span>
                  <span>{availablePercentage}% disponibile</span>
                </div>
              </div>
            );
          })}
          
          {dealers.length === 0 && (
            <div className="flex items-center justify-center h-20 text-gray-500">
              Nessun concessionario disponibile
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DealerCreditList;
