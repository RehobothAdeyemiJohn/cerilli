
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Retrieve environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Errore: Variabili d\'ambiente Supabase mancanti');
}

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

// Log all'avvio dell'app per verificare la configurazione
console.log('Inizializzazione client Supabase con URL:', supabaseUrl);
isSupabaseConfigured();
