import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

// Resolve where to send a freshly-onboarded user. Picks their most-recent
// client_access grant; falls back to /family-tree (the default landing for
// invitees with no demo access).
export async function postSignupRedirectFor(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from('client_access')
    .select('client:client_id(slug)')
    .eq('user_id', userId)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // The Supabase typegen treats foreign-key joins as either a single object
  // or an array depending on the relationship; normalize defensively.
  const client = data?.client as { slug: string } | { slug: string }[] | null | undefined;
  const slug = Array.isArray(client) ? client[0]?.slug : client?.slug;
  return slug ? `/demo/${slug}` : '/family-tree';
}
