
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/api/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Migration = () => {
  // Check if Supabase is properly configured
  const { data: connectionStatus, isLoading } = useQuery({
    queryKey: ['supabaseConnection'],
    queryFn: async () => {
      try {
        if (!isSupabaseConfigured()) {
          return { connected: false, error: 'Supabase non è configurato correttamente' };
        }
        
        // Try to fetch a test record from vehicles table
        const { data, error } = await supabase.from('vehicles').select('id').limit(1);
        return { 
          connected: !error, 
          error: error ? error.message : null,
          hasData: Array.isArray(data) && data.length > 0
        };
      } catch (error) {
        return { 
          connected: false, 
          error: error instanceof Error ? error.message : 'Errore sconosciuto' 
        };
      }
    }
  });

  return (
    <div className="container px-4 py-8">
      <Helmet>
        <title>Database Info - Cirelli Motor Company</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Informazioni Database</h1>
      
      <Card className="w-full max-w-xl mx-auto mb-6">
        <CardHeader>
          <CardTitle>Database Supabase</CardTitle>
          <CardDescription>
            Informazioni sulla configurazione del database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin h-5 w-5 border-2 border-blue-600 rounded-full border-t-transparent"></div>
              <span className="ml-2">Verifica connessione...</span>
            </div>
          ) : connectionStatus?.connected ? (
            <Alert className="mb-4 bg-green-50 border-green-600">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Database Connesso</AlertTitle>
              <AlertDescription>
                L'applicazione è correttamente connessa al database Supabase.
                <div className="mt-2">
                  <ul className="list-disc pl-5 text-sm">
                    <li>Tutti i dati verranno salvati direttamente su Supabase</li>
                    <li>Il localStorage non verrà utilizzato per la persistenza dei dati</li>
                    <li>È possibile popolare manualmente il database tramite l'interfaccia utente</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 bg-amber-50 border-amber-600">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-600">Problema di Connessione</AlertTitle>
              <AlertDescription>
                Impossibile connettersi al database Supabase.
                <div className="mt-2">
                  <ul className="list-disc pl-5 text-sm">
                    <li>Verifica che le variabili d'ambiente siano configurate correttamente</li>
                    <li>Controlla la connessione internet</li>
                    <li>Assicurati che il progetto Supabase sia attivo</li>
                  </ul>
                </div>
                {connectionStatus?.error && (
                  <div className="mt-2 p-2 bg-amber-100 rounded text-xs font-mono overflow-auto">
                    Errore: {connectionStatus.error}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {connectionStatus?.connected && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Status del Database:</h3>
              <div className="text-sm text-muted-foreground">
                {connectionStatus.hasData ? (
                  <span className="text-green-600 font-medium">Database contiene dati</span>
                ) : (
                  <span className="text-amber-600 font-medium">Database vuoto - Nessun dato presente</span>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Per utilizzare correttamente l'applicazione, assicurati che:
              <ul className="list-disc pl-5 mt-2">
                <li>Le variabili d'ambiente di Supabase siano configurate correttamente</li>
                <li>La connessione a internet sia attiva</li>
                <li>Il progetto Supabase sia attivo e accessibile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Schema del Database</CardTitle>
          <CardDescription>
            Tabelle principali presenti nel database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Vehicles</h3>
              <p className="text-sm text-muted-foreground">Archivio di tutti i veicoli disponibili, prenotati e venduti.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Dealers</h3>
              <p className="text-sm text-muted-foreground">Informazioni sui concessionari partner.</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium">Preventivi e Ordini</h3>
              <p className="text-sm text-muted-foreground">Gestione di preventivi e ordini effettuati dai concessionari.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Migration;
