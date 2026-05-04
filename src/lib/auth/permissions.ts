import 'server-only';
import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types/family';
import type { PermissionKey, Role } from '@/types/admin';
import { roleHasPermission } from './permissions.client';

export { roleHasPermission };

export interface AuthBundle {
  user: User;
  profile: Profile;
  role: Role;
}

export async function getCurrentUserWithRole(): Promise<AuthBundle | null> {
  // During build / static generation env vars may be missing — treat as unauthenticated.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*, role:roles(*)')
    .eq('id', user.id)
    .single<Profile & { role: Role }>();

  if (error || !data || !data.role) return null;

  const { role, ...profile } = data;
  return { user, profile, role };
}

export async function requirePermission(perm: PermissionKey): Promise<AuthBundle> {
  const bundle = await getCurrentUserWithRole();
  if (!bundle) redirect('/login');
  if (bundle.profile.disabled || !roleHasPermission(bundle.role, perm)) {
    redirect('/');
  }
  return bundle;
}

export async function requireAnyPermission(perms: PermissionKey[]): Promise<AuthBundle> {
  const bundle = await getCurrentUserWithRole();
  if (!bundle) redirect('/login');
  if (bundle.profile.disabled || !perms.some((p) => roleHasPermission(bundle.role, p))) {
    redirect('/');
  }
  return bundle;
}

