
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
            // This is a placeholder - in a real app, you'd calculate used credit
            // For now, we'll use a random percentage between 30% and 90%
            const usedPercentage = Math.floor(Math.random() * 60) + 30;
            const remainingCredit = creditLimit * (1 - usedPercentage / 100);
            
            return (
              <div key={dealer.id} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{dealer.companyName}</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {formatCurrency(remainingCredit)} / {formatCurrency(creditLimit)}
                  </span>
                </div>
                <Progress value={usedPercentage} className="h-2" />
                <div className="text-right text-xs text-gray-500">
                  {100 - usedPercentage}% disponibile
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
