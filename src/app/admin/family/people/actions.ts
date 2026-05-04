'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import type { Person } from '@/types/family';

type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };
type PersonInput = Omit<Person, 'id' | 'created_at' | 'updated_at'>;

// Whitelist what the client may send — Supabase ignores unknown columns but
// being explicit keeps the contract obvious and audits compact.
function pickPersonFields(input: PersonInput | Partial<PersonInput>): Partial<PersonInput> {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    birth_date: input.birth_date,
    death_date: input.death_date,
    photo_url: input.photo_url,
    bio: input.bio,
  };
}

function summarizePerson(input: Partial<PersonInput>): Record<string, unknown> {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    keys_changed: Object.keys(input),
  };
}

export async function createPerson(input: PersonInput): Promise<Result<{ id: string }>> {
  await requirePermission('edit_people');
  if (!input.first_name?.trim()) return { ok: false, error: 'First name is required' };
  const supabase = await createClient();
  const payload = pickPersonFields(input);
  const { data, error } = await supabase.from('people').insert(payload).select('id').single();
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'person.created', targetType: 'person', targetId: data.id, metadata: summarizePerson(payload) });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true, data: { id: data.id } };
}

export async function updatePerson(id: string, input: Partial<PersonInput>): Promise<Result> {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const payload = pickPersonFields(input);
  const { data, error } = await supabase
    .from('people')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Person not found.' };
  await logAudit({ action: 'person.updated', targetType: 'person', targetId: id, metadata: summarizePerson(payload) });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true };
}

export async function deletePerson(id: string): Promise<Result> {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const { data, error } = await supabase.from('people').delete().eq('id', id).select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Person not found.' };
  await logAudit({ action: 'person.deleted', targetType: 'person', targetId: id });
  revalidatePath('/admin/family/people');
  revalidatePath('/family-tree');
  return { ok: true };
}
