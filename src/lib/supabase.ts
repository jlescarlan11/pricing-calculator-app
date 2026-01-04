import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file. Cloud features will be disabled.');
}

// Fallback to empty strings if missing to avoid createClient crashing
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '');
