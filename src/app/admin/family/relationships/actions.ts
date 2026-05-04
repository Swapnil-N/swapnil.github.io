'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import type { Relationship } from '@/types/family';

type Result = { ok: true } | { ok: false; error: string };
type RelationshipInput = Omit<Relationship, 'id'>;

const RELATIONSHIP_TYPES: Relationship['relationship_type'][] = ['parent', 'child', 'spouse', 'sibling'];

export async function createRelationship(input: RelationshipInput): Promise<Result> {
  await requirePermission('edit_relationships');
  if (!input.person_id || !input.related_person_id) {
    return { ok: false, error: 'Both people are required' };
  }
  if (input.person_id === input.related_person_id) {
    return { ok: false, error: 'A person cannot be related to themselves' };
  }
  if (!RELATIONSHIP_TYPES.includes(input.relationship_type)) {
    return { ok: false, error: 'Invalid relationship type' };
  }
  const supabase = await createClient();
  const payload: RelationshipInput = {
    person_id: input.person_id,
    related_person_id: input.related_person_id,
    relationship_type: input.relationship_type,
  };
  const { error } = await supabase.from('relationships').insert(payload);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'relationship.created', targetType: 'relationship', metadata: payload });
  revalidatePath('/admin/family/relationships');
  revalidatePath('/family-tree');
  return { ok: true };
}

export async function deleteRelationship(id: string): Promise<Result> {
  await requirePermission('edit_relationships');
  const supabase = await createClient();
  const { data, error } = await supabase.from('relationships').delete().eq('id', id).select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Relationship not found.' };
  await logAudit({ action: 'relationship.deleted', targetType: 'relationship', targetId: id });
  revalidatePath('/admin/family/relationships');
  revalidatePath('/family-tree');
  return { ok: true };
}
