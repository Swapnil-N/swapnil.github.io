import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import PeopleTable from './PeopleTable';
import type { Person } from '@/types/family';

export const dynamic = 'force-dynamic';

export default async function AdminPeoplePage() {
  await requirePermission('edit_people');
  const supabase = await createClient();
  const { data } = await supabase.from('people').select('*').order('first_name');

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">People</h2>
        <p className="text-sm text-muted mt-1">Manage family members shown on the family tree.</p>
      </div>
      <PeopleTable people={(data ?? []) as Person[]} />
    </div>
  );
}
