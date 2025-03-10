
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModelsSettings from '@/components/settings/ModelsSettings';
import TrimsSettings from '@/components/settings/TrimsSettings';
import FuelTypesSettings from '@/components/settings/FuelTypesSettings';
import ColorsSettings from '@/components/settings/ColorsSettings';
import TransmissionsSettings from '@/components/settings/TransmissionsSettings';
import AccessoriesSettings from '@/components/settings/AccessoriesSettings';

const Settings = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>
      
      <Tabs defaultValue="models" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="models">Modelli</TabsTrigger>
          <TabsTrigger value="trims">Allestimenti</TabsTrigger>
          <TabsTrigger value="fuelTypes">Alimentazioni</TabsTrigger>
          <TabsTrigger value="colors">Colori</TabsTrigger>
          <TabsTrigger value="transmissions">Cambio</TabsTrigger>
          <TabsTrigger value="accessories">Accessori</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models" className="space-y-4">
          <ModelsSettings />
        </TabsContent>
        
        <TabsContent value="trims" className="space-y-4">
          <TrimsSettings />
        </TabsContent>
        
        <TabsContent value="fuelTypes" className="space-y-4">
          <FuelTypesSettings />
        </TabsContent>
        
        <TabsContent value="colors" className="space-y-4">
          <ColorsSettings />
        </TabsContent>
        
        <TabsContent value="transmissions" className="space-y-4">
          <TransmissionsSettings />
        </TabsContent>
        
        <TabsContent value="accessories" className="space-y-4">
          <AccessoriesSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
