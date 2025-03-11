
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { vehiclesApi } from '@/api/supabase/vehiclesApi';
import { dealersApi } from '@/api/supabase/dealersApi';
import { useToast } from '@/components/ui/use-toast';

const DataMigration = () => {
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState<string>('');
  const { toast } = useToast();

  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setMigrationStatus('idle');
      setMigrationMessage('');

      // Migrate dealers first
      await dealersApi.migrateFromMockData();
      
      // Then migrate vehicles
      await vehiclesApi.migrateFromLocalStorage();
      
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
      setMigrationMessage('Si è verificato un errore durante la migrazione dei dati.');
      
      toast({
        title: "Errore di migrazione",
        description: "Si è verificato un errore durante la migrazione dei dati.",
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
            <AlertDescription>{migrationMessage}</AlertDescription>
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
          disabled={isMigrating}
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
