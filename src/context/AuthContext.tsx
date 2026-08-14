import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  userProfile: User | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to map Supabase auth User to App User interface
const mapSupabaseUserToAppUser = (sbUser: SupabaseUser): User => {
  const fullName =
    sbUser.user_metadata?.full_name ||
    sbUser.user_metadata?.name ||
    sbUser.email?.split('@')[0] ||
    'Explorer';

  const handleSlug = (sbUser.email?.split('@')[0] || 'explorer')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  const avatar =
    sbUser.user_metadata?.avatar_url ||
    sbUser.user_metadata?.picture ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(sbUser.id)}`;

  return {
    id: sbUser.id,
    name: fullName,
    email: sbUser.email || '',
    handle: `@${handleSlug}`,
    avatar,
  };
};

// Fallback user when using demo mode prior to Supabase setup
const DEMO_USER: User = {
  id: 'u-demo',
  name: 'Demo Explorer',
  email: 'demo@tuki.app',
  handle: '@demo_explorer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      // Supabase credentials not set up yet in .env.local -> check localStorage mock login session
      const savedMockSession = localStorage.getItem('tuki_mock_user');
      if (savedMockSession) {
        setUserProfile(JSON.parse(savedMockSession));
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserProfile(mapSupabaseUserToAppUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserProfile(mapSupabaseUserToAppUser(session.user));
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  const signUp = async (email: string, password: string, name: string) => {
    if (!configured) {
      // Mock registration fallback if env vars missing
      const newMockUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        handle: `@${email.split('@')[0]}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      };
      localStorage.setItem('tuki_mock_user', JSON.stringify(newMockUser));
      setUserProfile(newMockUser);
      return { success: true, message: 'Account created! (Demo Mode)' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user && !data.session) {
        return {
          success: true,
          message: 'Account created! Please check your email inbox to verify your account.',
        };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!configured) {
      // Mock login fallback if env vars missing
      const mockUser: User = {
        ...DEMO_USER,
        email,
        name: email.split('@')[0],
      };
      localStorage.setItem('tuki_mock_user', JSON.stringify(mockUser));
      setUserProfile(mockUser);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const signInWithGoogle = async () => {
    if (!configured) {
      // Mock Google login fallback
      const mockUser: User = {
        id: `u-google-${Date.now()}`,
        name: 'Google User',
        email: 'googleuser@gmail.com',
        handle: '@google_user',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      };
      localStorage.setItem('tuki_mock_user', JSON.stringify(mockUser));
      setUserProfile(mockUser);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/groups`,
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Google Auth failed' };
    }
  };

  const signOut = async () => {
    if (!configured) {
      localStorage.removeItem('tuki_mock_user');
      setUserProfile(null);
      return;
    }

    await supabase.auth.signOut();
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userProfile,
        loading,
        isConfigured: configured,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
