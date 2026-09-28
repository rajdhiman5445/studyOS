import { useState, useEffect } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';

let currentUser: User | null = null;
let currentSession: Session | null = null;
let isAuthLoading = isSupabaseConfigured;
const authListeners = new Set<() => void>();

if (typeof window !== 'undefined' && isSupabaseConfigured) {
  supabase.auth.getSession().then(({ data: { session } }) => {
    currentSession = session;
    currentUser = session?.user ?? null;
    isAuthLoading = false;
    authListeners.forEach((fn) => fn());
  }).catch((err) => {
    console.error('Failed to restore Supabase auth session:', err);
    isAuthLoading = false;
    authListeners.forEach((fn) => fn());
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    currentUser = session?.user ?? null;
    isAuthLoading = false;
    authListeners.forEach((fn) => fn());
  });
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(currentUser);
  const [session, setSession] = useState<Session | null>(currentSession);
  const [isLoading, setIsLoading] = useState(isAuthLoading);

  useEffect(() => {
    const update = () => {
      setUser(currentUser);
      setSession(currentSession);
      setIsLoading(isAuthLoading);
    };
    authListeners.add(update);
    update();
    return () => {
      authListeners.delete(update);
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: new Error('Supabase environment variables are missing. Please configure .env') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data.session) {
      currentSession = data.session;
      currentUser = data.user;
      isAuthLoading = false;
      authListeners.forEach((fn) => fn());
    }
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    currentUser = null;
    currentSession = null;
    isAuthLoading = false;
    authListeners.forEach((fn) => fn());
  };

  return {
    user,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signIn,
    signOut,
  };
}
