import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import RolesGrid from './RolesGrid';
import EmptyState from '@/components/admin/ui/EmptyState';
import type { Role } from '@/types/admin';

export const dynamic = 'force-dynamic';

export default async function AdminRolesPage() {
  await requirePermission('manage_roles');
  const supabase = await createClient();
  const { data } = await supabase.from('roles').select('*').order('is_system', { ascending: false }).order('name');
  const roles = (data ?? []) as Role[];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Roles</h2>
        <p className="text-sm text-muted mt-1">Toggle granular permissions or create new custom roles.</p>
      </div>
      {roles.length === 0 ? <EmptyState title="No roles yet" /> : <RolesGrid roles={roles} />}
    </div>
  );
}
