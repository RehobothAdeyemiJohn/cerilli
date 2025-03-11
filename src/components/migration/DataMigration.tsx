
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/api/supabase/client';
import { 
  Database, 
  Table, 
  RefreshCcw, 
  AlertTriangle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface TableCreationProps {
  tableName: string;
  createFunction: string;
  exists: boolean;
  onSuccess?: () => void;
}

const TableCreationButton: React.FC<TableCreationProps> = ({ 
  tableName, 
  createFunction, 
  exists, 
  onSuccess 
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const createTable = async () => {
    setIsCreating(true);
    
    try {
      const { error } = await supabase.rpc(createFunction);
      
      if (error) {
        console.error(`Error creating ${tableName} table:`, error);
        toast.error(`Errore nella creazione della tabella ${tableName}`);
        return;
      }
      
      toast.success(`Tabella ${tableName} creata con successo!`);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(`Error creating ${tableName} table:`, error);
      toast.error(`Errore nella creazione della tabella ${tableName}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button 
      onClick={createTable} 
      disabled={isCreating || exists}
      variant={exists ? "outline" : "default"}
      size="sm"
      className="w-full mb-2"
    >
      <Table className="mr-2 h-4 w-4" />
      {exists 
        ? `${tableName} (già presente)` 
        : isCreating 
          ? `Creazione ${tableName} in corso...` 
          : `Crea tabella ${tableName}`
      }
    </Button>
  );
};

export const DataMigration: React.FC<{
  tablesInfo?: any;
  onSuccess?: () => void;
}> = ({ tablesInfo, onSuccess }) => {
  const [isCreatingTables, setIsCreatingTables] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

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
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Errore nella creazione delle tabelle');
    } finally {
      setIsCreatingTables(false);
    }
  };

  const resetDatabase = async () => {
    setIsResettingDatabase(true);
    
    try {
      // Drop tables in correct order to respect foreign key constraints
      const { error: ordersError } = await supabase.rpc('drop_orders_table_if_exists');
      if (ordersError) {
        console.error('Error dropping orders table:', ordersError);
        toast.error('Errore nell\'eliminazione della tabella orders');
        return;
      }
      
      const { error: quotesError } = await supabase.rpc('drop_quotes_table_if_exists');
      if (quotesError) {
        console.error('Error dropping quotes table:', quotesError);
        toast.error('Errore nell\'eliminazione della tabella quotes');
        return;
      }
      
      const { error: vehiclesError } = await supabase.rpc('drop_vehicles_table_if_exists');
      if (vehiclesError) {
        console.error('Error dropping vehicles table:', vehiclesError);
        toast.error('Errore nell\'eliminazione della tabella vehicles');
        return;
      }
      
      const { error: dealersError } = await supabase.rpc('drop_dealers_table_if_exists');
      if (dealersError) {
        console.error('Error dropping dealers table:', dealersError);
        toast.error('Errore nell\'eliminazione della tabella dealers');
        return;
      }
      
      toast.success('Database azzerato con successo!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error resetting database:', error);
      toast.error('Errore nell\'azzeramento del database');
    } finally {
      setIsResettingDatabase(false);
      setResetDialogOpen(false);
    }
  };

  const allTablesExist = tablesInfo && 
    tablesInfo.vehicles.exists && 
    tablesInfo.dealers.exists && 
    tablesInfo.quotes.exists && 
    tablesInfo.orders.exists;

  const noTablesExist = tablesInfo && 
    !tablesInfo.vehicles.exists && 
    !tablesInfo.dealers.exists && 
    !tablesInfo.quotes.exists && 
    !tablesInfo.orders.exists;

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm">
            {noTablesExist ? (
              <p className="mb-2">Il database è vuoto. Puoi creare le tabelle necessarie per l'applicazione:</p>
            ) : !allTablesExist ? (
              <p className="mb-2">Alcune tabelle sono mancanti. Puoi crearle singolarmente o tutte insieme:</p>
            ) : (
              <p className="mb-2">Tutte le tabelle sono presenti nel database.</p>
            )}

            {!allTablesExist && (
              <Button 
                onClick={createTables} 
                disabled={isCreatingTables}
                className="w-full mb-4"
              >
                <Database className="mr-2 h-4 w-4" />
                {isCreatingTables ? 'Creazione tabelle in corso...' : 'Crea Tutte le Tabelle'}
              </Button>
            )}

            {tablesInfo && (
              <div className="mt-4">
                <h3 className="font-medium mb-2 text-sm">Creazione Tabelle Individuali:</h3>
                <div className="space-y-2">
                  <TableCreationButton 
                    tableName="Dealers" 
                    createFunction="create_dealers_table" 
                    exists={tablesInfo.dealers.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Vehicles" 
                    createFunction="create_vehicles_table" 
                    exists={tablesInfo.vehicles.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Quotes" 
                    createFunction="create_quotes_table" 
                    exists={tablesInfo.quotes.exists}
                    onSuccess={onSuccess}
                  />
                  <TableCreationButton 
                    tableName="Orders" 
                    createFunction="create_orders_table" 
                    exists={tablesInfo.orders.exists}
                    onSuccess={onSuccess}
                  />
                </div>
              </div>
            )}

            {tablesInfo && !noTablesExist && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-2 text-sm">Reset Database:</h3>
                <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      className="w-full"
                    >
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Azzera Database
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Conferma Reset Database</DialogTitle>
                      <DialogDescription>
                        Questa azione eliminerà tutte le tabelle e i dati presenti nel database. 
                        L'operazione non può essere annullata.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="bg-amber-50 p-3 rounded border border-amber-200 mt-2">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium">Attenzione:</p>
                          <p>Tutti i dati saranno eliminati permanentemente!</p>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setResetDialogOpen(false)}
                      >
                        Annulla
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={resetDatabase}
                        disabled={isResettingDatabase}
                      >
                        {isResettingDatabase ? 'Eliminazione in corso...' : 'Conferma Reset'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataMigration;
