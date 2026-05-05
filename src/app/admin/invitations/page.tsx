import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import InvitationsList from './InvitationsList';
import type { Invitation } from '@/types/family';
import type { Client } from '@/types/client';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  await requirePermission('invite');
  const supabase = await createClient();

  const [{ data: invitationsData }, { data: unclaimedData }] = await Promise.all([
    supabase.from('invitations').select('*').order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('slug, business_name')
      .is('owner_user_id', null)
      .eq('status', 'demo')
      .order('business_name'),
  ]);

  const invitations = (invitationsData ?? []) as Invitation[];
  const unclaimedDemos = (unclaimedData ?? []) as Pick<Client, 'slug' | 'business_name'>[];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Invitations</h2>
        <p className="text-sm text-muted mt-1">
          Send sign-up invites for family members or client demo access. Revoke pending invites anytime.
        </p>
      </div>
      <InvitationsList invitations={invitations} unclaimedDemos={unclaimedDemos} />
    </div>
  );
}
