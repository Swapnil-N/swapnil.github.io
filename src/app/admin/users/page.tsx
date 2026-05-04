import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import UsersTable from './UsersTable';
import EmptyState from '@/components/admin/ui/EmptyState';
import type { Role } from '@/types/admin';
import type { Profile } from '@/types/family';

export const dynamic = 'force-dynamic';

async function loadLastSignIns(): Promise<Map<string, string | null>> {
  try {
    const admin = createServiceRoleClient();
    const { data } = await admin.auth.admin.listUsers({ perPage: 200 });
    const map = new Map<string, string | null>();
    (data?.users ?? []).forEach((u) => map.set(u.id, u.last_sign_in_at ?? null));
    return map;
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) return new Map();
    throw err;
  }
}

export default async function AdminUsersPage() {
  const { user } = await requirePermission('manage_users');
  const supabase = await createClient();

  const [{ data: profiles }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('roles').select('*').order('name'),
  ]);

  const lastSignIns = await loadLastSignIns();
  const rows = (profiles as Profile[] | null ?? []).map((p) => ({
    id: p.id,
    email: p.email,
    display_name: p.display_name,
    role_id: p.role_id,
    disabled: p.disabled,
    last_sign_in_at: lastSignIns.get(p.id) ?? null,
  }));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Users</h2>
        <p className="text-sm text-muted mt-1">Assign roles, disable access, or remove accounts.</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState title="No users yet" />
      ) : (
        <UsersTable users={rows} roles={(roles ?? []) as Role[]} currentUserId={user.id} />
      )}
    </div>
  );
}
