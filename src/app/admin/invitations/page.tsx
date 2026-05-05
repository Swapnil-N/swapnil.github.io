import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import InvitationsList from './InvitationsList';
import type { Invitation } from '@/types/family';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  await requirePermission('invite');
  const supabase = await createClient();
  const { data } = await supabase.from('invitations').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Invitations</h2>
        <p className="text-sm text-muted mt-1">Send sign-up invites and revoke pending ones.</p>
      </div>
      <InvitationsList invitations={(data ?? []) as Invitation[]} />
    </div>
  );
}
