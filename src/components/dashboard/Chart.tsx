
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export const Chart = () => {
  // Query per ottenere i dati dei veicoli
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehiclesChart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('model, status')
        .order('model');
      
      if (error) {
        console.error('Error fetching vehicles data:', error);
        throw error;
      }
      return data || [];
    }
  });

  // Prepara i dati per il grafico
  const chartData = useMemo(() => {
    if (!vehicles) return [];

    const modelCounts = vehicles.reduce((acc: { [key: string]: number }, vehicle) => {
      acc[vehicle.model] = (acc[vehicle.model] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(modelCounts).map(([model, total]) => ({
      model,
      total
    }));
  }, [vehicles]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Veicoli per Modello</CardTitle>
          <CardDescription>Caricamento in corso...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Veicoli per Modello</CardTitle>
        <CardDescription>
          Distribuzione dei veicoli per modello
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="model"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-primary"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
