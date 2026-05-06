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

  // Pull demos + any pending invitations targeting a slug, in parallel.
  // Pending invitations let us show "Pending: bob@…" before the invitee has
  // confirmed (handle_user_confirmed binds owner_user_id only on confirmation).
  const [{ data: clientsRaw }, { data: pendingInvitesRaw }] = await Promise.all([
    supabase
      .from('clients')
      .select('id, slug, business_name, owner_user_id, status, payment_link_url, created_at, last_seen_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('invitations')
      .select('email, client_slug')
      .eq('status', 'pending')
      .not('client_slug', 'is', null),
  ]);

  const clients = (clientsRaw ?? []) as Client[];

  // Owner email map (populated only after the invitee confirms).
  const ownerIds = clients.map((c) => c.owner_user_id).filter((id): id is string => !!id);
  let profileMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', ownerIds);
    profileMap = new Map((profiles as Pick<Profile, 'id' | 'email'>[] ?? []).map((p) => [p.id, p.email]));
  }

  const pendingByClientSlug = new Map(
    (pendingInvitesRaw ?? []).map((i) => [i.client_slug as string, i.email as string]),
  );

  const demos = clients.map((c) => ({
    ...c,
    owner_email: c.owner_user_id ? (profileMap.get(c.owner_user_id) ?? null) : null,
    pending_invitee_email: pendingByClientSlug.get(c.slug) ?? null,
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
      <DemosTable demos={demos} />
    </div>
  );
}
