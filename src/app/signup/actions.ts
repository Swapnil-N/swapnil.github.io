'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { logAudit } from '@/lib/auth/audit';

type Result<E = void> = E extends void
  ? { ok: true } | { ok: false; error: string }
  : { ok: true } & E | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('host') ?? '';
  return `${proto}://${host}`;
}

interface SelfSignupParams {
  email: string;
  password: string;
  display_name: string;
}

// Design C: user opened the /signup URL the admin shared. Validate against
// the invitations allowlist, then call supabase.auth.signUp. Supabase sends
// a confirmation email; clicking it lands them on /auth/callback → exchange
// → handle_user_confirmed → /demo or /family-tree.
export async function selfSignup({ email, password, display_name }: SelfSignupParams): Promise<Result> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !EMAIL_RE.test(trimmed)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!display_name.trim()) return { ok: false, error: 'Display name is required.' };

  const supabase = await createClient();

  // Belt-and-braces allowlist check (handle_new_user trigger also enforces).
  const { data: inv } = await supabase
    .from('invitations')
    .select('client_slug')
    .eq('email', trimmed)
    .eq('status', 'pending')
    .maybeSingle();
  if (!inv) {
    return {
      ok: false,
      error: 'This email is not on the invitation list. Ask an admin to invite you.',
    };
  }

  const origin = await siteOrigin();
  const target = inv.client_slug ? `/demo/${inv.client_slug}` : '/family-tree';
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(target)}`;

  const { error } = await supabase.auth.signUp({
    email: trimmed,
    password,
    options: {
      emailRedirectTo,
      data: { display_name: display_name.trim() },
    },
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

interface CompleteAccountParams {
  password: string;
  display_name: string;
}

// Design B: user clicked the Supabase invite email, the trigger already
// created their profile + client_access. They land on /signup authenticated
// to set their password and display name.
export async function completeAccount({
  password,
  display_name,
}: CompleteAccountParams): Promise<{ ok: true; redirect: string } | { ok: false; error: string }> {
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!display_name.trim()) return { ok: false, error: 'Display name is required.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const { error: pwErr } = await supabase.auth.updateUser({ password });
  if (pwErr) return { ok: false, error: pwErr.message };

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ display_name: display_name.trim() })
    .eq('id', user.id);
  if (profileErr) return { ok: false, error: profileErr.message };

  // Find where to send them: their most-recent demo grant, else /family-tree.
  const { data: access } = await supabase
    .from('client_access')
    .select('client:client_id(slug)')
    .eq('user_id', user.id)
    .order('granted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let redirect = '/family-tree';
  if (access?.client) {
    const c = access.client as { slug: string } | { slug: string }[];
    const slug = Array.isArray(c) ? c[0]?.slug : c.slug;
    if (slug) redirect = `/demo/${slug}`;
  }

  await logAudit({
    action: 'profile.signup_completed',
    targetType: 'profile',
    targetId: user.id,
  });

  return { ok: true, redirect };
}
