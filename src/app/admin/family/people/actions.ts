'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import type { Person } from '@/types/family';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
type PersonInput = Omit<Person, 'id' | 'created_at' | 'updated_at'>;

export async function createPerson(input: PersonInput): Promise<Result<{ id: string }>> {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const { data, error } = await supabase.from('people').insert(input).select('id').single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'person.created', targetType: 'person', targetId: data.id, metadata: { ...input } });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true, data: { id: data.id } };
}

export async function updatePerson(id: string, input: Partial<PersonInput>): Promise<Result> {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const { error } = await supabase.from('people').update({ ...input, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'person.updated', targetType: 'person', targetId: id, metadata: { ...input } });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true };
}

export async function deletePerson(id: string): Promise<Result> {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'person.deleted', targetType: 'person', targetId: id });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true };
}
