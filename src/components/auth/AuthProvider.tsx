'use client';

import { createContext, useContext, useEffect, type ReactNode } from 'react';
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
  const router = useRouter();
  const currentUserId = initialAuth?.user.id ?? null;

  useEffect(() => {
    const supabase = createClient();
    // Only refresh when the identity actually changes. Skipping TOKEN_REFRESHED
    // and same-user events avoids redundant router.refresh() churn during
    // background token rotation.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT') return;
      const nextId = session?.user.id ?? null;
      if (nextId !== currentUserId) {
        router.refresh();
      }
    });
    return () => subscription.unsubscribe();
  }, [router, currentUserId]);

  return <AuthContext.Provider value={{ auth: initialAuth }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState | null {
  return useContext(AuthContext).auth;
}
