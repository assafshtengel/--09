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

// Add request interceptor to log auth issues
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Supabase Client] Auth state changed:', event, session?.user?.id);
  
  if (event === 'SIGNED_IN') {
    console.log('[Supabase Client] User signed in, session:', {
      accessToken: session?.access_token?.slice(0, 10) + '...',
      userId: session?.user?.id,
      email: session?.user?.email,
    });
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('[Supabase Client] Token refreshed');
  } else if (event === 'SIGNED_OUT') {
    console.log('[Supabase Client] User signed out');
    localStorage.removeItem('supabase.auth.token');
  }
});

// Add debug logging for requests
const originalAuthRequest = supabase.auth.getSession.bind(supabase.auth);
supabase.auth.getSession = async () => {
  console.log('[Supabase Client] Getting session...');
  try {
    const response = await originalAuthRequest();
    console.log('[Supabase Client] Session response:', {
      hasSession: !!response.data.session,
      error: response.error,
    });
    return response;
  } catch (error) {
    console.error('[Supabase Client] Error getting session:', error);
    throw error;
  }
};