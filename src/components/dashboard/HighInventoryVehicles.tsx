
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDaysInStock } from '@/lib/utils';
import { Vehicle } from '@/types';

interface HighInventoryVehiclesProps {
  vehicles: Vehicle[];
  darkMode?: boolean;
}

const HighInventoryVehicles: React.FC<HighInventoryVehiclesProps> = ({ vehicles, darkMode = false }) => {
  // Sort vehicles by days in stock (descending) and take top 5
  const sortedVehicles = React.useMemo(() => {
    return [...vehicles]
      .filter(v => v.location !== 'Stock Virtuale')
      .map(v => ({
        ...v,
        daysInStock: calculateDaysInStock(v.dateAdded)
      }))
      .sort((a, b) => b.daysInStock - a.daysInStock)
      .slice(0, 5);
  }, [vehicles]);

  return (
    <Card className={`overflow-hidden transition-all duration-300 hover:shadow-md rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : ''}`}>
      <CardHeader>
        <CardTitle className={darkMode ? 'text-white' : ''}>Veicoli con Giacenza più Alta</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedVehicles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`text-left border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`pb-2 font-medium ${darkMode ? 'text-gray-300' : ''}`}>Modello</th>
                  <th className={`pb-2 font-medium ${darkMode ? 'text-gray-300' : ''}`}>Telaio</th>
                  <th className={`pb-2 font-medium ${darkMode ? 'text-gray-300' : ''}`}>Giorni</th>
                </tr>
              </thead>
              <tbody>
                {sortedVehicles.filter((obj: any, index: any, self: any) => {
                    console.log(self.findIndex((o: any) => o.model === obj.model));
                     return index === self.findIndex((o: any) => o.model === obj.model)
                    }).map((vehicle) => (
                  <tr key={vehicle.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className="py-3">{vehicle.model}</td>
                    <td className="py-3">{vehicle.telaio || 'N/A'}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vehicle.daysInStock > 180 ? 'bg-red-100 text-red-800' :
                        vehicle.daysInStock > 90 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {vehicle.daysInStock} giorni
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-gray-500">
            Nessun veicolo disponibile
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HighInventoryVehicles;
