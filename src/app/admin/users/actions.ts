'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type Result = { ok: true } | { ok: false; error: string };

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('host') ?? '';
  return `${proto}://${host}`;
}

export async function updateUserRole(userId: string, roleId: string): Promise<Result> {
  const { user } = await requirePermission('manage_users');
  if (userId === user.id) {
    return { ok: false, error: 'You cannot change your own role. Ask another admin.' };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', userId)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'User not found or update was denied.' };
  await logAudit({ action: 'profile.role_changed', targetType: 'profile', targetId: userId, metadata: { role_id: roleId } });
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setUserDisabled(userId: string, disabled: boolean): Promise<Result> {
  const { user } = await requirePermission('manage_users');
  if (userId === user.id) {
    return { ok: false, error: 'You cannot disable yourself.' };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update({ disabled })
    .eq('id', userId)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'User not found or update was denied.' };
  await logAudit({ action: disabled ? 'profile.disabled' : 'profile.enabled', targetType: 'profile', targetId: userId });
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { ok: true };
}

export async function sendPasswordReset(userId: string): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { data: profile, error: lookupError } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single();
  if (lookupError || !profile?.email) {
    return { ok: false, error: 'User not found.' };
  }
  const origin = await siteOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'profile.password_reset_sent', targetType: 'profile', targetId: userId });
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<Result> {
  const { user } = await requirePermission('manage_users');
  if (userId === user.id) {
    return { ok: false, error: 'You cannot delete your own account.' };
  }
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return { ok: false, error: error.message };
    await logAudit({ action: 'profile.deleted', targetType: 'profile', targetId: userId });
    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) {
      return { ok: false, error: 'Service role key not configured — cannot hard-delete users.' };
    }
    throw err;
  }
}
