
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts';
import { useAuth } from '@/context/AuthContext';

interface ChartProps {
  title?: string;
  data?: any[];
  color?: string;
  darkMode?: boolean;
}

export const Chart = ({ 
  title = 'Veicoli per Modello', 
  data, 
  color = '#3B82F6',
  darkMode = false
}: ChartProps) => {
  const { user } = useAuth();
  const isDealer = user?.type === 'dealer';
  const dealerId = user?.dealerId;
  
  // If data is provided directly, use it instead of querying
  const useProvidedData = !!data;
  
  // Query to get vehicle data (only if data is not provided)
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehiclesChart', dealerId],
    queryFn: async () => {
      if (useProvidedData) return null;
      
      let query = supabase.from('vehicles').select('model, status');
      
      // Filter by dealer if in dealer mode
      if (isDealer && dealerId) {
        query = query.eq('reservedby', dealerId);
      }
      
      const { data, error } = await query.order('model');
      
      if (error) {
        console.error('Error fetching vehicles data:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !useProvidedData
  });

  // Prepare chart data
  const chartData = useMemo(() => {
    if (useProvidedData) return data;
    if (!vehicles) return [];

    const modelCounts = vehicles.reduce((acc: { [key: string]: number }, vehicle) => {
      acc[vehicle.model] = (acc[vehicle.model] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(modelCounts).map(([model, total]) => ({
      model,
      total
    }));
  }, [vehicles, data, useProvidedData]);

  // Colors for bars
  const COLORS = ['#4ADE80', '#818CF8', '#FB7185', '#FACC15', '#60A5FA', '#C084FC'];

  if (isLoading && !useProvidedData) {
    return (
      <Card className={`overflow-hidden ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : ''}>Caricamento in corso...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden transition-transform duration-300 rounded-xl ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      <CardHeader className={darkMode ? 'bg-gray-900' : 'bg-white'}>
        <CardTitle className={darkMode ? 'text-white' : ''}>{title}</CardTitle>
        <CardDescription className={darkMode ? 'text-gray-400' : ''}>
          Distribuzione dei dati
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2 pt-4">
        <div className="h-[200px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="model" 
                stroke={darkMode ? "#888888" : "#888888"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={darkMode ? "#888888" : "#888888"}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                formatter={(value) => [value, 'Quantità']}
                contentStyle={{ 
                  backgroundColor: darkMode ? '#333' : 'white', 
                  border: darkMode ? '1px solid #555' : '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  color: darkMode ? '#fff' : 'inherit'
                }}
              />
              <Legend />
              <Bar
                dataKey="total"
                name="Quantità"
                radius={[4, 4, 0, 0]}
                animationDuration={1500}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default Chart;
