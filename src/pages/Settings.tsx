
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModelsSettings from '@/components/settings/ModelsSettings';

const Settings = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>
      
      <Tabs defaultValue="models" className="w-full">
        <TabsList>
          <TabsTrigger value="models">Modelli</TabsTrigger>
        </TabsList>
        
        <TabsContent value="models">
          <ModelsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
