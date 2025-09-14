import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type UserProfile = {
  id?: string;
  full_name?: string;
  role?: 'parent' | 'coach' | 'director' | string;
  [key: string]: unknown;
};

type AuthContextType = {
  user: any;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ data: any; error: any }>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // ⚠️ PROTECTED FUNCTION - DO NOT MODIFY OR ADD ASYNC OPERATIONS
  // This is a Supabase auth state change listener that must remain synchronous
  const handleAuthStateChange = (_event: any, session: any) => {
    // SYNC OPERATIONS ONLY - NO ASYNC/AWAIT ALLOWED
    if (session?.user) {
      setUser(session?.user);
      // Fetch user profile after setting user
      fetchUserProfile(session?.user?.id);
    } else {
      setUser(null);
      setUserProfile(null);
    }
    setLoading(false);
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data as UserProfile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  useEffect(() => {
    // Get initial session - Use Promise chain
    supabase?.auth?.getSession()?.then(({ data: { session } }: any) => {
        if (session?.user) {
          setUser(session?.user);
          fetchUserProfile(session?.user?.id);
        }
        setLoading(false);
      });

    const { data: { subscription } }: any = supabase?.auth?.onAuthStateChange(handleAuthStateChange);

    return () => subscription?.unsubscribe();
  }, []);

  // Auth methods
  const signUp = async (email: string, password: string, userData: Record<string, unknown> = {}) => {
    try {
      const { data, error } = await supabase?.auth?.signUp({
        email,
        password,
        options: {
          data: userData
        }
      } as any);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error } as any;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase?.auth?.signInWithPassword({
        email,
        password
      } as any);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error } as any;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase?.auth?.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error } as any;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase?.auth?.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { data: null, error } as any;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

