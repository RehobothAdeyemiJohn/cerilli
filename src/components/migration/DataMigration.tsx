
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, Info } from 'lucide-react';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
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
    const checkConnection = async () => {
      try {
        // First check if Supabase is configured
        if (!isSupabaseConfigured()) {
          console.error('Supabase non è configurato correttamente');
          setIsSupabaseConnected(false);
          return;
        }

        // Then test the connection
        const { data, error } = await supabase.from('vehicles').select('count(*)');
        if (error) {
          console.error('Errore connessione Supabase:', error);
          setIsSupabaseConnected(false);
          setMigrationStatus('error');
          setMigrationMessage('Impossibile connettersi a Supabase.');
          setErrorDetails(`Errore di connessione: ${error.message}`);
          return;
        }
        
        setIsSupabaseConnected(true);
      } catch (error) {
        console.error('Errore test connessione:', error);
        setIsSupabaseConnected(false);
        setMigrationStatus('error');
        setMigrationMessage('Errore durante il test di connessione a Supabase.');
        setErrorDetails(error instanceof Error ? error.message : 'Errore sconosciuto');
      }
    };

    checkConnection();
  }, []);

  const testSupabaseConnection = async () => {
    try {
      // First check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.error('Supabase non è configurato correttamente');
        return false;
      }
      
      const { data, error } = await supabase.from('vehicles').select('count(*)');
      if (error) {
        console.error('Errore connessione Supabase:', error);
        return false;
      }
      console.log('Connessione Supabase stabilita con successo');
      return true;
    } catch (error) {
      console.error('Errore test connessione:', error);
      return false;
    }
  };

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationStatus('idle');
      setMigrationMessage('');
      setErrorDetails('');

      console.log('Avvio test connessione Supabase...');
      // Test Supabase connection first
      const isConnected = await testSupabaseConnection();
      if (!isConnected) {
        console.error('Test connessione fallito');
        throw new Error('Impossibile connettersi a Supabase. Verifica la tua connessione e le credenziali.');
      }
      console.log('Test connessione completato con successo');

      // Migrate dealers first
      console.log('Inizio migrazione dealers...');
      await dealersApi.migrateFromMockData();
      console.log('Dealers migrati con successo');
      
      // Then migrate vehicles
      console.log('Inizio migrazione veicoli...');
      await vehiclesApi.migrateFromLocalStorage();
      console.log('Veicoli migrati con successo');
      
      // Set success status
      setMigrationStatus('success');
      setMigrationMessage('I dati sono stati migrati correttamente a Supabase!');
      
      toast({
        title: "Migrazione completata",
        description: "I dati sono stati migrati correttamente al database Supabase.",
      });
    } catch (error) {
      console.error('Errore durante la migrazione:', error);
      setMigrationStatus('error');
      
      // Create a more detailed error message
      let errorMessage = 'Si è verificato un errore durante la migrazione dei dati.';
      let details = '';
      
      if (error instanceof Error) {
        details = `${error.name}: ${error.message}`;
        
        // Add more specific messaging based on error type
        if (error.message.includes('network')) {
          errorMessage = 'Errore di rete durante la connessione a Supabase.';
        } else if (error.message.includes('authentication') || error.message.includes('credenziali')) {
          errorMessage = 'Errore di autenticazione con Supabase. Verifica le credenziali.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Errore di autorizzazione. Verifica le policy di Supabase.';
        } else if (error.message.includes('connettersi')) {
          errorMessage = 'Impossibile connettersi a Supabase. Verifica la configurazione.';
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
            Questa operazione sposterà tutti i veicoli e i dealer dal localStorage al database Supabase.
            Non verranno apportate modifiche ai dati locali, quindi potrai continuare a utilizzare
            l'applicazione come prima nel caso in cui ci fossero problemi.
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
