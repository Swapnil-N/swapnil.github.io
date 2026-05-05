import 'server-only';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import type { Client } from '@/types/client';

const VALID_STATUSES = ['demo', 'paid', 'archived'] as const satisfies readonly Client['status'][];

export interface DemoClientInfo {
  id: string;
  slug: string;
  business_name: string;
  payment_link_url: string | null;
  status: Client['status'];
}

export interface DemoGateResult {
  client: DemoClientInfo;
  isAdmin: boolean;
}

export async function gateDemo(slug: string): Promise<DemoGateResult> {
  const auth = await getCurrentUserWithRole();
  if (!auth) redirect(`/login?redirect=/demo/${slug}`);
  if (auth.profile.disabled) redirect('/login?error=disabled');

  const supabase = await createClient();
  const { data: client } = await supabase
    .from('clients')
    .select('id, slug, business_name, payment_link_url, status, owner_user_id')
    .eq('slug', slug)
    .maybeSingle();

  if (!client) notFound();

  const rawStatus = client.status as string;
  if (!VALID_STATUSES.includes(rawStatus as Client['status'])) {
    throw new Error(`Unexpected client status: ${rawStatus}`);
  }

  const isAdmin = auth.role.can_manage_users;
  const isOwner = client.owner_user_id === auth.user.id;
  if (!isAdmin && !isOwner) redirect('/');

  // Archived demos are hidden from clients (admins can still preview).
  if ((rawStatus as Client['status']) === 'archived' && !isAdmin) redirect('/');

  if (isOwner) {
    // SECURITY DEFINER RPC — only updates last_seen_at for the caller's own row.
    // Avoids granting a blanket UPDATE policy to the client role.
    await supabase.rpc('touch_demo_last_seen', { p_slug: slug });
  }

  return {
    client: {
      id: client.id,
      slug: client.slug,
      business_name: client.business_name,
      payment_link_url: client.payment_link_url,
      status: rawStatus as Client['status'],
    },
    isAdmin,
  };
}
