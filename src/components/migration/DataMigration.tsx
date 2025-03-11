
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/api/supabase/client';

export const DataMigration: React.FC = () => {
  const [isCreatingTables, setIsCreatingTables] = useState(false);

  const createTables = async () => {
    setIsCreatingTables(true);
    
    try {
      // Create Dealers table
      const { error: dealersError } = await supabase.rpc('create_dealers_table');
      
      if (dealersError) {
        console.error('Error creating dealers table:', dealersError);
        toast.error('Errore nella creazione della tabella dealers');
        return;
      }
      
      // Create Vehicles table
      const { error: vehiclesError } = await supabase.rpc('create_vehicles_table');
      
      if (vehiclesError) {
        console.error('Error creating vehicles table:', vehiclesError);
        toast.error('Errore nella creazione della tabella vehicles');
        return;
      }
      
      // Create Quotes table
      const { error: quotesError } = await supabase.rpc('create_quotes_table');
      
      if (quotesError) {
        console.error('Error creating quotes table:', quotesError);
        toast.error('Errore nella creazione della tabella quotes');
        return;
      }
      
      // Create Orders table
      const { error: ordersError } = await supabase.rpc('create_orders_table');
      
      if (ordersError) {
        console.error('Error creating orders table:', ordersError);
        toast.error('Errore nella creazione della tabella orders');
        return;
      }
      
      toast.success('Tabelle create con successo!');
      window.location.reload(); // Refresh to update table counts
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Errore nella creazione delle tabelle');
    } finally {
      setIsCreatingTables(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm">
            <p className="mb-2">Il database è attualmente vuoto. Puoi creare le tabelle necessarie per l'applicazione:</p>
            <Button 
              onClick={createTables} 
              disabled={isCreatingTables}
              className="w-full"
            >
              {isCreatingTables ? 'Creazione tabelle in corso...' : 'Crea Tabelle nel Database'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
