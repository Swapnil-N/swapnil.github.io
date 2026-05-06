import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import DemosTable from './DemosTable';
import CreateDemoFormToggle from './CreateDemoFormToggle';
import type { Client } from '@/types/client';
import type { Profile } from '@/types/family';

export const dynamic = 'force-dynamic';

export default async function AdminDemosPage() {
  await requirePermission('manage_users');
  const supabase = await createClient();

  const [
    { data: clientsRaw },
    { data: accessRows },
    { data: pendingInvites },
    { data: profiles },
    { data: roles },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('id, slug, business_name, status, payment_link_url, created_at, last_seen_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('client_access')
      .select('client_id, user_id'),
    supabase
      .from('invitations')
      .select('email, client_slug')
      .eq('status', 'pending')
      .not('client_slug', 'is', null),
    supabase
      .from('profiles')
      .select('id, email, display_name, role_id, disabled'),
    supabase
      .from('roles')
      .select('id, can_manage_users'),
  ]);

  const clients = (clientsRaw ?? []) as Client[];
  const adminRoleIds = new Set(
    (roles ?? []).filter((r) => r.can_manage_users).map((r) => r.id as string),
  );
  type ProfileRow = Pick<Profile, 'id' | 'email' | 'display_name' | 'role_id' | 'disabled'>;
  const allProfiles = (profiles as ProfileRow[] ?? []);
  const profileById = new Map(allProfiles.map((p) => [p.id, p]));
  const eligibleUsers = allProfiles
    .filter((p) => !p.disabled && !adminRoleIds.has(p.role_id))
    .map((p) => ({ id: p.id, email: p.email, display_name: p.display_name }));

  // Group access rows by client_id → list of {user_id, email, display_name}.
  const accessByClient = new Map<string, { user_id: string; email: string; display_name: string | null }[]>();
  for (const row of accessRows ?? []) {
    const profile = profileById.get(row.user_id as string);
    if (!profile) continue;
    const list = accessByClient.get(row.client_id as string) ?? [];
    list.push({ user_id: row.user_id as string, email: profile.email, display_name: profile.display_name });
    accessByClient.set(row.client_id as string, list);
  }

  // Pending demo invites grouped by slug.
  const pendingByClientSlug = new Map<string, string[]>();
  for (const inv of pendingInvites ?? []) {
    const slug = inv.client_slug as string;
    const list = pendingByClientSlug.get(slug) ?? [];
    list.push(inv.email as string);
    pendingByClientSlug.set(slug, list);
  }

  const demos = clients.map((c) => ({
    ...c,
    access_users: accessByClient.get(c.id) ?? [],
    pending_invitee_emails: pendingByClientSlug.get(c.slug) ?? [],
  }));

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground">Demos</h2>
          <p className="text-sm text-muted mt-1">
            Manage client demo sites. Each demo is hosted at <code className="font-mono">/demo/&#123;slug&#125;</code>.
          </p>
        </div>
        <CreateDemoFormToggle />
      </div>
      <DemosTable demos={demos} eligibleUsers={eligibleUsers} />
    </div>
  );
}
