
import React from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Migration = () => {
  return (
    <div className="container px-4 py-8">
      <Helmet>
        <title>Database Info - Cirelli Motor Company</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Informazioni Database</h1>
      
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Database Supabase</CardTitle>
          <CardDescription>
            Informazioni sulla configurazione del database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-blue-50 border-blue-600">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-600">Database Live</AlertTitle>
            <AlertDescription>
              L'applicazione è configurata per utilizzare direttamente il database Supabase.
              <div className="mt-2">
                <ul className="list-disc pl-5 text-sm">
                  <li>Tutti i dati verranno salvati direttamente su Supabase</li>
                  <li>Il localStorage non verrà utilizzato per la persistenza dei dati</li>
                  <li>È possibile popolare manualmente il database tramite l'interfaccia utente</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="py-2">
            <div className="text-sm text-muted-foreground mb-4">
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
    </div>
  );
};

export default Migration;
