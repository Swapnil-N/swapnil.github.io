'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import type { Role } from '@/types/admin';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
type RoleInput = Pick<Role, 'name' | 'description' | 'can_manage_users' | 'can_manage_roles' | 'can_invite' | 'can_edit_people' | 'can_edit_relationships' | 'can_view_family_tree' | 'can_view_audit_log'>;

export async function createRole(input: RoleInput): Promise<Result<{ id: string }>> {
  await requirePermission('manage_roles');
  if (!input.name?.trim()) return { ok: false, error: 'Name is required' };
  const supabase = await createClient();
  const { data, error } = await supabase.from('roles').insert(input).select('id').single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'role.created', targetType: 'role', targetId: data.id, metadata: { ...input } });
  revalidatePath('/admin/roles');
  return { ok: true, data: { id: data.id } };
}

export async function updateRole(id: string, input: Partial<RoleInput>): Promise<Result> {
  await requirePermission('manage_roles');
  const supabase = await createClient();
  const { data, error } = await supabase.from('roles').update(input).eq('id', id).select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Role not found.' };
  await logAudit({ action: 'role.updated', targetType: 'role', targetId: id, metadata: { ...input } });
  revalidatePath('/admin/roles');
  return { ok: true };
}

export async function deleteRole(id: string): Promise<Result> {
  await requirePermission('manage_roles');
  const supabase = await createClient();
  const { data, error } = await supabase.from('roles').delete().eq('id', id).select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Role not found.' };
  await logAudit({ action: 'role.deleted', targetType: 'role', targetId: id });
  revalidatePath('/admin/roles');
  return { ok: true };
}
