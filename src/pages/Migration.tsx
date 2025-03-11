
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Database, Info, Link2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/api/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DataMigration } from '@/components/migration/DataMigration';

const Migration = () => {
  // Ottieni i valori delle variabili d'ambiente
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Test di connessione a Supabase
  const { 
    data: connectionStatus, 
    isLoading, 
    refetch: refetchConnection
  } = useQuery({
    queryKey: ['supabaseConnection'],
    queryFn: async () => {
      try {
        if (!isSupabaseConfigured()) {
          return { 
            connected: false, 
            error: 'Supabase non è configurato correttamente',
            envStatus: {
              url: !!supabaseUrl,
              key: !!supabaseKey && supabaseKey.length > 20
            }
          };
        }
        
        // Prova a fare una richiesta a Supabase per verificare la connessione
        const { data, error } = await supabase.from('vehicles').select('id').limit(1);
        
        if (error && error.code !== '42P01') { // 42P01 is "relation does not exist", which is expected if tables don't exist yet
          console.error('Errore nel test di connessione a Supabase:', error);
          return { 
            connected: false, 
            error: error.message, 
            details: error.details || 'Nessun dettaglio disponibile',
            errorCode: error.code,
            envStatus: {
              url: !!supabaseUrl,
              key: !!supabaseKey && supabaseKey.length > 20
            }
          };
        }
        
        return { 
          connected: true, 
          error: null,
          hasData: Array.isArray(data) && data.length > 0,
          tablesExist: error?.code !== '42P01',
          envStatus: {
            url: !!supabaseUrl,
            key: !!supabaseKey && supabaseKey.length > 20
          }
        };
      } catch (error) {
        console.error('Errore nel test di connessione a Supabase:', error);
        return { 
          connected: false, 
          error: error instanceof Error ? error.message : 'Errore sconosciuto',
          details: error instanceof Error ? error.stack : 'Nessun dettaglio disponibile',
          envStatus: {
            url: !!supabaseUrl,
            key: !!supabaseKey && supabaseKey.length > 20
          }
        };
      }
    }
  });

  // Ottieni informazioni sulle tabelle del database
  const { 
    data: tablesInfo, 
    isLoading: tablesLoading,
    refetch: refetchTables 
  } = useQuery({
    queryKey: ['supabaseTables'],
    queryFn: async () => {
      if (!connectionStatus?.connected) return null;
      
      try {
        // Controlla se le tabelle esistono prima di contare i record
        const { data: tables, error: tablesError } = await supabase.rpc('list_tables');
        
        if (tablesError) {
          console.error('Errore nel recupero delle tabelle:', tablesError);
          return null;
        }
        
        const tableExists = (tableName: string) => 
          Array.isArray(tables) && tables.some(t => t.table_name === tableName);
        
        // Inizializza i conteggi
        const counts = {
          vehicles: { count: 0, error: null, exists: tableExists('vehicles') },
          dealers: { count: 0, error: null, exists: tableExists('dealers') },
          quotes: { count: 0, error: null, exists: tableExists('quotes') },
          orders: { count: 0, error: null, exists: tableExists('orders') }
        };
        
        // Conta i record solo se le tabelle esistono
        if (counts.vehicles.exists) {
          const { count: vehiclesCount, error: vehiclesError } = await supabase
            .from('vehicles')
            .select('*', { count: 'exact', head: true });
          
          counts.vehicles.count = vehiclesCount || 0;
          counts.vehicles.error = vehiclesError;
        }
        
        if (counts.dealers.exists) {
          const { count: dealersCount, error: dealersError } = await supabase
            .from('dealers')
            .select('*', { count: 'exact', head: true });
          
          counts.dealers.count = dealersCount || 0;
          counts.dealers.error = dealersError;
        }
        
        if (counts.quotes.exists) {
          const { count: quotesCount, error: quotesError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true });
          
          counts.quotes.count = quotesCount || 0;
          counts.quotes.error = quotesError;
        }
        
        if (counts.orders.exists) {
          const { count: ordersCount, error: ordersError } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true });
          
          counts.orders.count = ordersCount || 0;
          counts.orders.error = ordersError;
        }
        
        return counts;
      } catch (error) {
        console.error('Errore nel recupero delle informazioni sulle tabelle:', error);
        return null;
      }
    },
    enabled: !!connectionStatus?.connected
  });

  // Funzione per testare manualmente la connessione
  const handleTestConnection = async () => {
    try {
      toast.loading('Test di connessione in corso...');
      const result = await refetchConnection();
      toast.dismiss();
      
      if (result.data?.connected) {
        toast.success('✅ Connessione a Supabase verificata con successo!');
      } else {
        toast.error('❌ Impossibile connettersi a Supabase');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Errore durante il test di connessione');
    }
  };

  // Funzione per aggiornare tutte le informazioni dopo operazioni sul database
  const handleDatabaseOperationSuccess = () => {
    // Aggiorna la connessione e le informazioni sulle tabelle
    refetchConnection();
    refetchTables();
  };

  // Verifica se tutte le tabelle esistono
  const allTablesExist = 
    tablesInfo && 
    tablesInfo.vehicles.exists && 
    tablesInfo.dealers.exists && 
    tablesInfo.quotes.exists && 
    tablesInfo.orders.exists;

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
                    {connectionStatus.errorCode && (
                      <div className="mt-1 text-xs">
                        Codice: {connectionStatus.errorCode}
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="mt-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Stato Variabili d'Ambiente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>VITE_SUPABASE_URL:</span>
                  <span className={connectionStatus?.envStatus?.url ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {connectionStatus?.envStatus?.url ? "Configurata ✓" : "Non configurata ✗"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VITE_SUPABASE_ANON_KEY:</span>
                  <span className={connectionStatus?.envStatus?.key ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {connectionStatus?.envStatus?.key ? "Configurata ✓" : "Non configurata o invalida ✗"}
                  </span>
                </div>
                
                {supabaseUrl && (
                  <div className="mt-3 text-xs overflow-hidden text-ellipsis">
                    <div className="text-muted-foreground">URL configurato:</div>
                    <div className="font-mono bg-gray-100 p-1 rounded mt-1 overflow-auto">
                      {supabaseUrl}
                    </div>
                  </div>
                )}
                
                {supabaseKey && (
                  <div className="mt-3 text-xs">
                    <div className="text-muted-foreground">Chiave configurata:</div>
                    <div className="font-mono bg-gray-100 p-1 rounded mt-1 overflow-auto">
                      {supabaseKey.substring(0, 16)}...{supabaseKey.substring(supabaseKey.length - 6)}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 pt-3 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleTestConnection} 
                    className="w-full"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Verifica Connessione
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {connectionStatus?.connected && (!connectionStatus.tablesExist || !allTablesExist) && (
            <DataMigration 
              tablesInfo={tablesInfo} 
              onSuccess={handleDatabaseOperationSuccess} 
            />
          )}
          
          {connectionStatus?.connected && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Status del Database:</h3>
              <div className="text-sm text-muted-foreground">
                {!allTablesExist ? (
                  <span className="text-amber-600 font-medium">Database vuoto o tabelle mancanti</span>
                ) : connectionStatus.hasData || (tablesInfo && (
                    tablesInfo.vehicles.count > 0 || 
                    tablesInfo.dealers.count > 0 || 
                    tablesInfo.quotes.count > 0 || 
                    tablesInfo.orders.count > 0
                  )) ? (
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
                  {!tablesInfo.vehicles.exists ? (
                    <span className="text-red-600">Tabella non presente</span>
                  ) : tablesInfo.vehicles.count > 0 ? (
                    <span className="text-green-600 font-medium">
                      {tablesInfo.vehicles.count} record presenti
                    </span>
                  ) : (
                    <span className="text-amber-600">Nessun dato</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Concessionari:</span>
                  {!tablesInfo.dealers.exists ? (
                    <span className="text-red-600">Tabella non presente</span>
                  ) : tablesInfo.dealers.count > 0 ? (
                    <span className="text-green-600 font-medium">
                      {tablesInfo.dealers.count} record presenti
                    </span>
                  ) : (
                    <span className="text-amber-600">Nessun dato</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Preventivi:</span>
                  {!tablesInfo.quotes.exists ? (
                    <span className="text-red-600">Tabella non presente</span>
                  ) : tablesInfo.quotes.count > 0 ? (
                    <span className="text-green-600 font-medium">
                      {tablesInfo.quotes.count} record presenti
                    </span>
                  ) : (
                    <span className="text-amber-600">Nessun dato</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Ordini:</span>
                  {!tablesInfo.orders.exists ? (
                    <span className="text-red-600">Tabella non presente</span>
                  ) : tablesInfo.orders.count > 0 ? (
                    <span className="text-green-600 font-medium">
                      {tablesInfo.orders.count} record presenti
                    </span>
                  ) : (
                    <span className="text-amber-600">Nessun dato</span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <Alert className="mt-6 bg-blue-50 border-blue-600">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">Informazioni di Risoluzione Problemi</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p className="mb-2">Se riscontri problemi con la connessione a Supabase, verifica che:</p>
                <ul className="list-disc pl-5">
                  <li>Il file <code className="bg-blue-100 px-1 rounded">.env</code> nella cartella principale contenga le variabili corrette:
                    <pre className="bg-blue-100 p-2 rounded text-xs mt-1 overflow-auto">
                      VITE_SUPABASE_URL=https://il-tuo-progetto.supabase.co{'\n'}
                      VITE_SUPABASE_ANON_KEY=la-tua-chiave-anonima
                    </pre>
                  </li>
                  <li className="mt-2">Se stai utilizzando Vite in modalità di sviluppo, riavvialo dopo aver modificato il file .env</li>
                  <li className="mt-2">Il tuo progetto Supabase sia attivo e accessibile</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
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
