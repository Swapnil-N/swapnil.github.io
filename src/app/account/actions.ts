'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';

type Result = { ok: true } | { ok: false; error: string };

export async function updateOwnProfile(input: { display_name: string | null; avatar_url: string | null }): Promise<Result> {
  const auth = await getCurrentUserWithRole();
  if (!auth) return { ok: false, error: 'Not signed in' };
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: input.display_name?.trim() || null,
      avatar_url: input.avatar_url?.trim() || null,
    })
    .eq('id', auth.user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/account');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function requestPasswordReset(): Promise<Result> {
  const auth = await getCurrentUserWithRole();
  if (!auth) return { ok: false, error: 'Not signed in' };
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(auth.user.email ?? '');
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
