'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/types/family';
import type { Role } from '@/types/admin';

export interface AuthState {
  user: User;
  profile: Profile;
  role: Role;
}

interface AuthContextValue {
  auth: AuthState | null;
}

const AuthContext = createContext<AuthContextValue>({ auth: null });

interface AuthProviderProps {
  initialAuth: AuthState | null;
  children: ReactNode;
}

export function AuthProvider({ initialAuth, children }: AuthProviderProps) {
  const [auth, setAuth] = useState<AuthState | null>(initialAuth);
  const router = useRouter();

  useEffect(() => {
    setAuth(initialAuth);
  }, [initialAuth]);

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setAuth(null);
      }
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router]);

  return <AuthContext.Provider value={{ auth }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState | null {
  return useContext(AuthContext).auth;
}
