'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import type { Relationship } from '@/types/family';

type Result = { ok: true } | { ok: false; error: string };
type RelationshipInput = Omit<Relationship, 'id'>;

export async function createRelationship(input: RelationshipInput): Promise<Result> {
  await requirePermission('edit_relationships');
  if (input.person_id === input.related_person_id) {
    return { ok: false, error: 'A person cannot be related to themselves' };
  }
  const supabase = await createClient();
  const { error } = await supabase.from('relationships').insert(input);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'relationship.created', targetType: 'relationship', metadata: { ...input } });
  revalidatePath('/admin/family/relationships');
  revalidatePath('/family-tree');
  return { ok: true };
}

export async function deleteRelationship(id: string): Promise<Result> {
  await requirePermission('edit_relationships');
  const supabase = await createClient();
  const { error } = await supabase.from('relationships').delete().eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'relationship.deleted', targetType: 'relationship', targetId: id });
  revalidatePath('/admin/family/relationships');
  revalidatePath('/family-tree');
  return { ok: true };
}
