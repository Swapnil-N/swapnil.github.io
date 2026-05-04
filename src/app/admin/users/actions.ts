'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type Result = { ok: true } | { ok: false; error: string };

export async function updateUserRole(userId: string, roleId: string): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ role_id: roleId }).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'profile.role_changed', targetType: 'profile', targetId: userId, metadata: { role_id: roleId } });
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setUserDisabled(userId: string, disabled: boolean): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { error } = await supabase.from('profiles').update({ disabled }).eq('id', userId);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: disabled ? 'profile.disabled' : 'profile.enabled', targetType: 'profile', targetId: userId });
  revalidatePath('/admin/users');
  revalidatePath('/admin');
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<Result> {
  await requirePermission('manage_users');
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
