
import React from 'react';
import { Helmet } from 'react-helmet';
import DataMigration from '@/components/migration/DataMigration';

const Migration = () => {
  return (
    <div className="container px-4 py-8">
      <Helmet>
        <title>Migrazione Dati - Cirelli Motor Company</title>
      </Helmet>
      <h1 className="text-2xl font-bold mb-6">Migrazione Dati a Supabase</h1>
      <DataMigration />
    </div>
  );
};

export default Migration;
