import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import RelationshipsTable from './RelationshipsTable';
import type { Person, Relationship } from '@/types/family';

export const dynamic = 'force-dynamic';

export default async function AdminRelationshipsPage() {
  await requirePermission('edit_relationships');
  const supabase = await createClient();
  const [{ data: relationships }, { data: people }] = await Promise.all([
    supabase.from('relationships').select('*'),
    supabase.from('people').select('*').order('first_name'),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Relationships</h2>
        <p className="text-sm text-muted mt-1">Connect family members. Edges drive the family tree layout.</p>
      </div>
      <RelationshipsTable
        relationships={(relationships ?? []) as Relationship[]}
        people={(people ?? []) as Person[]}
      />
    </div>
  );
}
