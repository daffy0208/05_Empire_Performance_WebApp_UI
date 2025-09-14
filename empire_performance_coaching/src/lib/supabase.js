import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

// Create a safe, no-throw placeholder when env vars are missing to avoid build/runtime crashes
let supabase;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  });
} else {
  // Minimal stub with the same surface used in the app
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null, error: new Error('Supabase not configured') }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null, error: new Error('Supabase not configured') }) }) }) })
  };
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env vars missing. Running with no-op client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export { supabase };
