
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Database } from 'lucide-react';
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
        
        if (error) {
          console.error('Errore nel test di connessione a Supabase:', error);
          return { 
            connected: false, 
            error: error.message, 
            details: error.details || 'Nessun dettaglio disponibile'
          };
        }
        
        return { 
          connected: true, 
          error: null,
          hasData: Array.isArray(data) && data.length > 0
        };
      } catch (error) {
        console.error('Errore nel test di connessione a Supabase:', error);
        return { 
          connected: false, 
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          details: error instanceof Error ? error.stack : 'Nessun dettaglio disponibile'
        };
      }
    }
  });

  // Get database tables information
  const { data: tablesInfo, isLoading: tablesLoading } = useQuery({
    queryKey: ['supabaseTables'],
    queryFn: async () => {
      if (!connectionStatus?.connected) return null;
      
      try {
        // Check vehicles count
        const { count: vehiclesCount, error: vehiclesError } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true });
        
        // Check dealers count
        const { count: dealersCount, error: dealersError } = await supabase
          .from('dealers')
          .select('*', { count: 'exact', head: true });
        
        // Check quotes count (may not exist yet)
        const { count: quotesCount, error: quotesError } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true });
        
        // Check orders count (may not exist yet)
        const { count: ordersCount, error: ordersError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
        
        return {
          vehicles: { count: vehiclesCount || 0, error: vehiclesError },
          dealers: { count: dealersCount || 0, error: dealersError },
          quotes: { count: quotesCount || 0, error: quotesError },
          orders: { count: ordersCount || 0, error: ordersError }
        };
      } catch (error) {
        console.error('Errore nel recupero delle informazioni sulle tabelle:', error);
        return null;
      }
    },
    enabled: !!connectionStatus?.connected
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
                    {connectionStatus.details && (
                      <div className="mt-1 text-xs">
                        Dettagli: {connectionStatus.details}
                      </div>
                    )}
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
          
          {connectionStatus?.connected && tablesInfo && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium mb-2">Stato delle Tabelle:</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Veicoli:</span>
                  <span className={tablesInfo.vehicles.count > 0 ? "text-green-600 font-medium" : "text-amber-600"}>
                    {tablesInfo.vehicles.count > 0 
                      ? `${tablesInfo.vehicles.count} record presenti` 
                      : "Nessun dato"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Concessionari:</span>
                  <span className={tablesInfo.dealers.count > 0 ? "text-green-600 font-medium" : "text-amber-600"}>
                    {tablesInfo.dealers.count > 0 
                      ? `${tablesInfo.dealers.count} record presenti` 
                      : "Nessun dato"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Preventivi:</span>
                  <span className={tablesInfo.quotes.count > 0 ? "text-green-600 font-medium" : "text-amber-600"}>
                    {tablesInfo.quotes.count > 0 
                      ? `${tablesInfo.quotes.count} record presenti` 
                      : "Nessun dato"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Ordini:</span>
                  <span className={tablesInfo.orders.count > 0 ? "text-green-600 font-medium" : "text-amber-600"}>
                    {tablesInfo.orders.count > 0 
                      ? `${tablesInfo.orders.count} record presenti` 
                      : "Nessun dato"}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Per utilizzare correttamente l'applicazione con Supabase, assicurati che:</p>
              <ul className="list-disc pl-5">
                <li>Le variabili d'ambiente di Supabase siano configurate correttamente nel file .env</li>
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
