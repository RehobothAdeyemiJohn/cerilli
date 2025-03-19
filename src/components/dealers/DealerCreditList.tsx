
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dealersApi } from '@/api/supabase/dealersApi';
import { formatCurrency } from '@/lib/utils';
import { formatPlafond } from '@/utils/dealerUtils';

interface DealerCreditListProps {
  darkMode?: boolean;
}

const DealerCreditList: React.FC<DealerCreditListProps> = ({ darkMode = false }) => {
  const { data: dealers = [], isLoading } = useQuery({
    queryKey: ['dealers'],
    queryFn: dealersApi.getAll,
  });

  React.useEffect(() => {
    console.log("DealerCreditList - Tutti i dealer caricati:", dealers);
  }, [dealers]);

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
            // Usiamo il creditLimit come valore base
            const plafondDisponibile = dealer.creditLimit || 0;
            
            console.log(`Rendering plafond per ${dealer.companyName}:`, {
              creditLimit: dealer.creditLimit,
              formatted: formatPlafond(plafondDisponibile)
            });
            
            return (
              <div key={dealer.id} className="flex justify-between items-center border-b last:border-0 pb-3 last:pb-0 mb-3 last:mb-0">
                <span className="font-medium">{dealer.companyName}</span>
                <span className={`font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                  {formatPlafond(plafondDisponibile)}
                </span>
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
