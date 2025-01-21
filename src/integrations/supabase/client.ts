import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Remove any trailing slashes and ensure URL is properly formatted
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || 'https://mmopqtoxstnbabavsics.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tb3BxdG94c3RuYmFiYXZzaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMDUzOTAsImV4cCI6MjA1MDg4MTM5MH0.Mo3skwtimANu_hnC6AFTiHcLSgMLb5LzFt7pKiYg7vY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-v2',
    },
  },
});

// Add a request interceptor to log auth issues
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Client] Auth state changed:', event, session?.user?.id);
});