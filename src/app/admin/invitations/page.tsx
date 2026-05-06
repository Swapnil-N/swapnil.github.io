import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import InvitationsList from './InvitationsList';
import type { Invitation } from '@/types/family';
import type { Client } from '@/types/client';

export const dynamic = 'force-dynamic';

export default async function AdminInvitationsPage() {
  await requirePermission('invite');
  const supabase = await createClient();

  // All non-archived demos are valid invite targets in the many-to-many model.
  // Duplicate (email, slug) pending invites are blocked at insert time by the
  // partial unique index — sendInvitation surfaces a clean error.
  const [{ data: invitationsData }, { data: allDemosRaw }] = await Promise.all([
    supabase.from('invitations').select('*').order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('slug, business_name, status')
      .order('business_name'),
  ]);

  const invitations = (invitationsData ?? []) as Invitation[];
  type DemoLite = Pick<Client, 'slug' | 'business_name' | 'status'>;
  const allDemos = (allDemosRaw ?? []) as DemoLite[];
  // Dropdown only offers non-archived demos; the lookup map covers all so
  // historical invitations to since-archived demos still render their name.
  const availableDemos = allDemos
    .filter((d) => d.status !== 'archived')
    .map(({ slug, business_name }) => ({ slug, business_name }));
  const businessNameBySlug: Record<string, string> = Object.fromEntries(
    allDemos.map((d) => [d.slug, d.business_name]),
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Invitations</h2>
        <p className="text-sm text-muted mt-1">
          Send sign-up invites for family members or client demo access. Revoke pending invites anytime.
        </p>
      </div>
      <InvitationsList
        invitations={invitations}
        availableDemos={availableDemos}
        businessNameBySlug={businessNameBySlug}
      />
    </div>
  );
}
