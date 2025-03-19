
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Using the same credentials as in src/integrations/supabase/client.ts to ensure consistency
const supabaseUrl = "https://idtyeemidnwidsizzwao.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkdHllZW1pZG53aWRzaXp6d2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MTE1MTAsImV4cCI6MjA1NzI4NzUxMH0.D3CExwfUNhBRXDEWjL6FINV445qP7-z5Xs5EHSvYpec";

// Create the Supabase client with enhanced options for performance
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  global: {
    fetch: (url: string, options: RequestInit) => fetch(url, options),
    headers: { 'x-application-name': 'cirelli-inventory' },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Utility function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase non configurato. Mancano URL o chiave API.');
    return false;
  }
  
  console.log('Supabase configurato con URL:', supabaseUrl);
  return true;
};

// Logging at app initialization to verify configuration
console.log('Inizializzazione client Supabase con URL:', supabaseUrl);
isSupabaseConfigured();
