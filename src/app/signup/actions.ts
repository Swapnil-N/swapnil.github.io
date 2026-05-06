'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/auth/audit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SelfSignupParams {
  email: string;
  password: string;
  display_name: string;
}

// Path C: user opened the /signup URL the admin shared (or the link in
// the Supabase invite email but didn't click "set up account" yet — we
// detect either case below). Validates the allowlist, then either creates
// the auth.users row (admin.createUser) OR promotes a pre-created row
// (updateUserById, when Supabase's inviteUserByEmail had already inserted
// it without a password). Either way we set email_confirm: true so no
// separate confirmation step is required — the admin's allowlist is the
// trust statement.
export async function selfSignup(
  { email, password, display_name }: SelfSignupParams,
): Promise<
  | { ok: true; redirect: string; email: string }
  | { ok: false; error: string }
> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !EMAIL_RE.test(trimmed)) return { ok: false, error: 'Enter a valid email address.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!display_name.trim()) return { ok: false, error: 'Display name is required.' };

  const supabase = await createClient();

  // Allowlist check (handle_new_user trigger also enforces; this gives a
  // friendlier error than the raw SQL exception).
  const { data: anyInv } = await supabase
    .from('invitations')
    .select('client_slug')
    .eq('email', trimmed)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle();
  if (!anyInv) {
    return {
      ok: false,
      error: 'This email is not on the invitation list. Ask an admin to invite you.',
    };
  }

  let admin;
  try {
    admin = createServiceRoleClient();
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) {
      return { ok: false, error: 'Service role key not configured — cannot create the account.' };
    }
    throw err;
  }

  // Look up any pre-existing auth row for this email. inviteUserByEmail
  // creates one with no password and email_confirmed_at=NULL.
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
  const existing = list?.users.find((u) => u.email?.toLowerCase() === trimmed);

  if (existing) {
    // Promote the half-formed account: set the password and confirm the
    // email. updating email_confirmed_at to a non-NULL value fires
    // handle_user_confirmed → _provision_invitee (idempotent).
    const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name.trim() },
    });
    if (updateErr) return { ok: false, error: updateErr.message };
  } else {
    // Fresh signup. createUser with email_confirm: true sets email_confirmed_at
    // immediately, so handle_new_user provisions on the same insert.
    const { error: createErr } = await admin.auth.admin.createUser({
      email: trimmed,
      password,
      email_confirm: true,
      user_metadata: { display_name: display_name.trim() },
    });
    if (createErr) return { ok: false, error: createErr.message };
  }

  // Where to send them: their first pending invitation's slug (the trigger
  // has already accepted it by now, but client_slug was queried above).
  const target = anyInv.client_slug ? `/demo/${anyInv.client_slug}` : '/family-tree';

  return { ok: true, redirect: target, email: trimmed };
}

interface CompleteAccountParams {
  password: string;
  display_name: string;
}

// Path B: user clicked the Supabase invite email. /auth/callback caught
// the implicit-flow tokens and established a session. The trigger has
// already created their profile + bound client_access. They land here
// to set a password and display name.
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
