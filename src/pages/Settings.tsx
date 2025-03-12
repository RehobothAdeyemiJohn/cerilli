
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModelsSettings from '@/components/settings/ModelsSettings';
import TrimsSettings from '@/components/settings/TrimsSettings';
import FuelTypesSettings from '@/components/settings/FuelTypesSettings';
import ColorsSettings from '@/components/settings/ColorsSettings';
import TransmissionsSettings from '@/components/settings/TransmissionsSettings';
import AccessoriesSettings from '@/components/settings/AccessoriesSettings';
import { Button } from '@/components/ui/button';
import { Database, ArrowUpFromLine, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/api/supabase/client';

// Import both the localStorage and Supabase APIs
import { 
  modelsApi as localModelsApi,
  trimsApi as localTrimsApi,
  fuelTypesApi as localFuelTypesApi,
  colorsApi as localColorsApi,
  transmissionsApi as localTransmissionsApi,
  accessoriesApi as localAccessoriesApi
} from '@/api/localStorage';

import {
  modelsApi as supabaseModelsApi,
  trimsApi as supabaseTrimsApi,
  fuelTypesApi as supabaseFuelTypesApi,
  colorsApi as supabaseColorsApi,
  transmissionsApi as supabaseTransmissionsApi,
  accessoriesApi as supabaseAccessoriesApi
} from '@/api/supabase/settingsApi';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('models');
  const [isMigrating, setIsMigrating] = useState(false);
  
  // Check if already migrated
  const [hasMigrated, setHasMigrated] = useState(false);
  
  useEffect(() => {
    const checkMigrationStatus = async () => {
      try {
        const { data: models, error } = await supabase.from('settings_models').select('id').limit(1);
        console.log('Migration check result:', { models, error });
        setHasMigrated(models && models.length > 0);
        
        // If migration has happened, set localStorage to use Supabase
        if (models && models.length > 0) {
          localStorage.setItem('useSupabaseSettings', 'true');
        }
      } catch (error) {
        console.error('Error checking migration status:', error);
      }
    };
    
    checkMigrationStatus();
  }, []);
  
  const migrateSettings = async () => {
    setIsMigrating(true);
    try {
      console.log('Starting migration to Supabase...');
      
      // Migrate models
      const models = await localModelsApi.getAll();
      console.log('Models to migrate:', models);
      
      for (const model of models) {
        await supabaseModelsApi.create({
          name: model.name,
          basePrice: model.basePrice
        });
      }
      
      // Migrate trims
      const trims = await localTrimsApi.getAll();
      for (const trim of trims) {
        await supabaseTrimsApi.create({
          name: trim.name,
          basePrice: trim.basePrice,
          compatibleModels: trim.compatibleModels || []
        });
      }
      
      // Migrate fuel types
      const fuelTypes = await localFuelTypesApi.getAll();
      for (const fuelType of fuelTypes) {
        await supabaseFuelTypesApi.create({
          name: fuelType.name,
          priceAdjustment: fuelType.priceAdjustment,
          compatibleModels: fuelType.compatibleModels || []
        });
      }
      
      // Migrate colors
      const colors = await localColorsApi.getAll();
      for (const color of colors) {
        await supabaseColorsApi.create({
          name: color.name,
          type: color.type,
          priceAdjustment: color.priceAdjustment,
          compatibleModels: color.compatibleModels || []
        });
      }
      
      // Migrate transmissions
      const transmissions = await localTransmissionsApi.getAll();
      for (const transmission of transmissions) {
        await supabaseTransmissionsApi.create({
          name: transmission.name,
          priceAdjustment: transmission.priceAdjustment,
          compatibleModels: transmission.compatibleModels || []
        });
      }
      
      // Migrate accessories
      const accessories = await localAccessoriesApi.getAll();
      for (const accessory of accessories) {
        await supabaseAccessoriesApi.create({
          name: accessory.name,
          priceWithVAT: accessory.priceWithVAT,
          priceWithoutVAT: accessory.priceWithoutVAT,
          compatibleModels: accessory.compatibleModels || [],
          compatibleTrims: accessory.compatibleTrims || []
        });
      }
      
      // Set localStorage to use Supabase
      localStorage.setItem('useSupabaseSettings', 'true');
      
      toast({
        title: "Migrazione completata",
        description: "Tutti i dati sono stati migrati su Supabase con successo.",
      });
      
      setHasMigrated(true);
    } catch (error) {
      console.error('Error migrating settings:', error);
      toast({
        title: "Errore durante la migrazione",
        description: "Si è verificato un errore durante la migrazione. Riprova.",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold">Impostazioni</h1>
        
        {!hasMigrated ? (
          <Button 
            onClick={migrateSettings} 
            disabled={isMigrating}
            variant="secondary"
            className="mt-4 md:mt-0"
          >
            {isMigrating ? (
              <>
                <Database className="mr-2 h-4 w-4 animate-spin" />
                Migrazione in corso...
              </>
            ) : (
              <>
                <ArrowUpFromLine className="mr-2 h-4 w-4" />
                Migra a Supabase
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center text-green-600 mt-4 md:mt-0">
            <CheckCircle className="mr-2 h-4 w-4" />
            <span>Dati su Supabase</span>
          </div>
        )}
      </div>
      
      <Tabs defaultValue="models" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="models">Modelli</TabsTrigger>
          <TabsTrigger value="trims">Allestimenti</TabsTrigger>
          <TabsTrigger value="fuelTypes">Tipi di Alimentazione</TabsTrigger>
          <TabsTrigger value="colors">Colori</TabsTrigger>
          <TabsTrigger value="transmissions">Cambi</TabsTrigger>
          <TabsTrigger value="accessories">Accessori</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models">
          <ModelsSettings />
        </TabsContent>
        
        <TabsContent value="trims">
          <TrimsSettings />
        </TabsContent>
        
        <TabsContent value="fuelTypes">
          <FuelTypesSettings />
        </TabsContent>
        
        <TabsContent value="colors">
          <ColorsSettings />
        </TabsContent>
        
        <TabsContent value="transmissions">
          <TransmissionsSettings />
        </TabsContent>
        
        <TabsContent value="accessories">
          <AccessoriesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
