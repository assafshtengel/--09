import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://mmopqtoxstnbabavsics.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tb3BxdG94c3RuYmFiYXZzaWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MzQwNDAsImV4cCI6MjAyMDMxMDA0MH0.dkWm3q3DXM4UQiNxOxqtj9V3TzLwVt5DGzQVqIXBOoY';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
  },
});