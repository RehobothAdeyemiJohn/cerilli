
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { quotesApi } from '@/api/localStorage/quotesApi';
import { ordersApi } from '@/api/localStorage/ordersApi';
import { useToast } from '@/components/ui/use-toast';
import { supabase, isSupabaseConfigured } from '@/api/supabase/client';

const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<string>('');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean | null>(null);
  const { toast } = useToast();

  // Check Supabase connection on component mount
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setIsSupabaseConnected(false);
        return;
      }

      const { data, error } = await supabase.from('vehicles').select('id').limit(1);
      setIsSupabaseConnected(!error);
      
      if (error) {
        setMigrationStatus('error');
        setMigrationMessage('Impossibile connettersi a Supabase.');
        setErrorDetails(`Errore di connessione: ${error.message}`);
      }
    } catch (error) {
      setIsSupabaseConnected(false);
      setMigrationStatus('error');
      setMigrationMessage('Errore durante il test di connessione a Supabase.');
      setErrorDetails(error instanceof Error ? error.message : 'Errore sconosciuto');
    }
  };

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationStatus('idle');
      setMigrationMessage('');
      setErrorDetails('');

      // 1. Migra prima i dealers
      console.log('Inizio migrazione dealers...');
      await dealersApi.migrateFromMockData();
      console.log('Dealers migrati con successo');

      // 2. Poi migra i veicoli
      console.log('Inizio migrazione veicoli...');
      await vehiclesApi.migrateFromLocalStorage();
      console.log('Veicoli migrati con successo');

      // 3. Migra i preventivi
      console.log('Inizio migrazione preventivi...');
      const quotes = await quotesApi.getAll();
      const { error: quotesError } = await supabase
        .from('quotes')
        .insert(quotes.map(quote => ({
          ...quote,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      
      if (quotesError) throw new Error(`Errore migrazione preventivi: ${quotesError.message}`);
      console.log('Preventivi migrati con successo');

      // 4. Migra gli ordini
      console.log('Inizio migrazione ordini...');
      const orders = await ordersApi.getAll();
      const { error: ordersError } = await supabase
        .from('orders')
        .insert(orders.map(order => ({
          ...order,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      
      if (ordersError) throw new Error(`Errore migrazione ordini: ${ordersError.message}`);
      console.log('Ordini migrati con successo');

      setMigrationStatus('success');
      setMigrationMessage('La migrazione è stata completata con successo!');
      
      toast({
        title: "Migrazione completata",
        description: "Tutti i dati sono stati migrati correttamente a Supabase.",
      });
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      setMigrationStatus('error');
      
      let errorMessage = 'Si è verificato un errore durante la migrazione dei dati.';
      let details = '';
      
      if (error instanceof Error) {
        details = `${error.name}: ${error.message}`;
        
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Alcuni dati sono già presenti in Supabase.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Errore di autorizzazione. Verifica le policy di Supabase.';
        }
      }
      
      setMigrationMessage(errorMessage);
      setErrorDetails(details);
      
      toast({
        title: "Errore di migrazione",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Migrazione Dati a Supabase</CardTitle>
        <CardDescription>
          Questo strumento migrerà i dati dal localStorage al database Supabase.
          I dati migreranno solo se non ci sono già dati in Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSupabaseConnected === false && (
          <Alert className="mb-4 bg-amber-50 border-amber-600">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-600">Connessione a Supabase non disponibile</AlertTitle>
            <AlertDescription>
              Verifica che Supabase sia configurato correttamente nell'applicazione.
              <ul className="mt-2 list-disc pl-5 text-sm">
                <li>Controlla che le variabili d'ambiente siano impostate</li>
                <li>Verifica che l'URL e la chiave API siano corretti</li>
                <li>Assicurati di avere una connessione internet attiva</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        {migrationStatus === 'success' && (
          <Alert className="mb-4 bg-green-50 border-green-600">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-600">Migrazione completata</AlertTitle>
            <AlertDescription>{migrationMessage}</AlertDescription>
          </Alert>
        )}
        
        {migrationStatus === 'error' && (
          <Alert className="mb-4 bg-red-50 border-red-600">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-600">Errore</AlertTitle>
            <AlertDescription>
              {migrationMessage}
              {errorDetails && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono overflow-auto">
                  {errorDetails}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            Questa operazione migrerà tutti i dati dal localStorage al database Supabase:
            <ul className="list-disc pl-5 mt-2">
              <li>Dealers e venditori</li>
              <li>Veicoli dell'inventario</li>
              <li>Preventivi</li>
              <li>Ordini</li>
            </ul>
          </p>
          <p className="text-sm font-medium text-amber-600 mb-2">
            Nota: I dati verranno migrati solo se non ci sono già dati in Supabase.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleMigration} 
          disabled={isMigrating || isSupabaseConnected === false}
          className="w-full"
        >
          {isMigrating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Migrazione in corso...
            </>
          ) : (
            'Avvia Migrazione'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DataMigration;
