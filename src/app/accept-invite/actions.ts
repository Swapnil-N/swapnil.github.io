'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/auth/audit';

type Result =
  | { ok: true; redirect: string }
  | { ok: false; error: string };

interface AcceptInviteParams {
  token: string;
  password: string;
}

export async function acceptInvite({ token, password }: AcceptInviteParams): Promise<Result> {
  if (!token) return { ok: false, error: 'Missing invitation token.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const supabase = await createClient();

  // Re-validate the token server-side (form might be stale).
  const { data: inv } = await supabase
    .from('invitations')
    .select('id, email, role_id, client_slug, status, expires_at')
    .eq('accept_token', token)
    .maybeSingle();
  if (!inv) return { ok: false, error: 'Invalid invitation token.' };
  if (inv.status === 'accepted') return { ok: false, error: 'This invitation was already accepted.' };
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return { ok: false, error: 'This invitation has expired.' };
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

  // Create the user with email pre-confirmed (the email itself is the proof
  // of identity here — they got the token via that mailbox).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: inv.email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    return { ok: false, error: createErr?.message ?? 'Could not create the account.' };
  }
  const newUserId = created.user.id;

  // Create the profile + bind access in a couple of explicit writes. We use
  // the service-role client so we can write rows that the user themselves
  // wouldn't have RLS for at this moment (no session yet on this server).
  const { error: profileErr } = await admin
    .from('profiles')
    .insert({
      id: newUserId,
      email: inv.email,
      role_id: inv.role_id,
    });
  if (profileErr) {
    // Rollback the auth user so the invitation can be retried cleanly.
    await admin.auth.admin.deleteUser(newUserId);
    return { ok: false, error: `Could not create profile: ${profileErr.message}` };
  }

  let redirectTo = '/family-tree';
  if (inv.client_slug) {
    const { data: clientRow } = await admin
      .from('clients')
      .select('id')
      .eq('slug', inv.client_slug)
      .maybeSingle();
    if (clientRow) {
      const { error: accessErr } = await admin
        .from('client_access')
        .insert({ client_id: clientRow.id, user_id: newUserId });
      if (accessErr) {
        // Soft-fail: account exists, profile exists, but access binding
        // failed. Surface it so the admin can fix manually rather than
        // silently leaving the user stranded on /family-tree.
        return { ok: false, error: `Account created but demo access binding failed: ${accessErr.message}` };
      }
      redirectTo = `/demo/${inv.client_slug}`;
    }
  }

  // Mark the invitation accepted. We also blank out the token so it can't be
  // reused even if the row sticks around.
  await admin
    .from('invitations')
    .update({ status: 'accepted', accept_token: null })
    .eq('id', inv.id);

  await logAudit({
    action: 'invitation.accepted',
    actorIdOverride: newUserId,
    targetType: 'invitation',
    targetId: inv.id,
    metadata: { email: inv.email, client_slug: inv.client_slug },
  });

  return { ok: true, redirect: redirectTo };
}
