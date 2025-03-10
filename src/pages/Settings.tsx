
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModelsSettings from '@/components/settings/ModelsSettings';
import TrimsSettings from '@/components/settings/TrimsSettings';
import FuelTypesSettings from '@/components/settings/FuelTypesSettings';
import ColorsSettings from '@/components/settings/ColorsSettings';
import TransmissionsSettings from '@/components/settings/TransmissionsSettings';
import AccessoriesSettings from '@/components/settings/AccessoriesSettings';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('models');

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>
      
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
