import 'server-only';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import type { Client } from '@/types/client';

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

  const isAdmin = auth.role.can_manage_users;
  const isOwner = client.owner_user_id === auth.user.id;
  if (!isAdmin && !isOwner) redirect('/');

  if (isOwner) {
    // Best-effort engagement tracking — never block the page load.
    supabase
      .from('clients')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', client.id)
      .then(() => {});
  }

  return {
    client: {
      id: client.id,
      slug: client.slug,
      business_name: client.business_name,
      payment_link_url: client.payment_link_url,
      status: client.status as Client['status'],
    },
    isAdmin,
  };
}
