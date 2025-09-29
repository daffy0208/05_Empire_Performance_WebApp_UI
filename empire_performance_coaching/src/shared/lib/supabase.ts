import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env?.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env?.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  });
} else {
  // Minimal no-op supabase to keep app running without env vars
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } as any }),
      signUp: async () => ({ data: null as any, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ data: null as any, error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ data: null as any, error: new Error('Supabase not configured') }),
    },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: null as any, error: new Error('Supabase not configured') }) }) }) })
  } as unknown as SupabaseClient;

  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.warn('Supabase env vars missing. Running with no-op client. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export { supabase };

