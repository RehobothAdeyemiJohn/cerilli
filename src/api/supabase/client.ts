
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Retrieve environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if we have the required configuration
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient<Database>(supabaseUrl, supabaseKey)
  : null;

// Utility function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase non configurato. Mancano URL o chiave API.');
    return false;
  }
  
  if (!supabase) {
    console.error('Cliente Supabase non inizializzato.');
    return false;
  }
  
  return true;
};
