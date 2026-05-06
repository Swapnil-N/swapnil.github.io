'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import { siteOrigin } from '@/lib/site-origin';

type Result =
  | { ok: true; signupUrl: string; emailSent: boolean; emailError?: string }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteParams {
  email: string;
  role?: 'family_member' | 'client';
  client_slug?: string;
}

export async function sendInvitation(
  { email, role = 'family_member', client_slug }: InviteParams,
): Promise<Result> {
  const { user } = await requirePermission('invite');
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: 'Email is required' };
  if (!EMAIL_RE.test(trimmed)) return { ok: false, error: 'Enter a valid email address' };
  if (role === 'client' && !client_slug) return { ok: false, error: 'Select a demo for client invitations' };

  const supabase = await createClient();

  // Refuse if a user already exists for this email — they should be granted
  // access via the Manage Access UI, not invited as a new account.
  try {
    const admin = createServiceRoleClient();
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users.find((u) => u.email?.toLowerCase() === trimmed);
    if (existing) {
      return {
        ok: false,
        error: role === 'client'
          ? 'A user with this email already exists. Use Manage Access on /admin/demos to grant them access to a demo.'
          : 'A user with this email already exists.',
      };
    }
  } catch (err) {
    if (!(err instanceof MissingServiceRoleKeyError)) throw err;
    // Without service-role we can't enumerate; proceed and rely on signUp errors.
  }

  // Resolve role_id
  const { data: roleRow, error: roleErr } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .maybeSingle();
  if (roleErr || !roleRow) return { ok: false, error: `Role '${role}' not found` };

  // Verify the demo exists if it's a client invite
  if (role === 'client' && client_slug) {
    const { data: clientRow } = await supabase
      .from('clients')
      .select('slug')
      .eq('slug', client_slug)
      .maybeSingle();
    if (!clientRow) return { ok: false, error: `Demo '${client_slug}' not found` };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('invitations')
    .insert({
      email: trimmed,
      invited_by: user.id,
      role_id: roleRow.id,
      client_slug: client_slug ?? null,
    })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return {
        ok: false,
        error: 'A pending invitation already exists for this email + demo combination. Revoke it first to re-send.',
      };
    }
    return { ok: false, error: insertError.message };
  }

  const origin = await siteOrigin();
  const signupUrl = `${origin}/signup?email=${encodeURIComponent(trimmed)}`;

  // Best-effort: ask Supabase to send a magic-link-style invite email. If it
  // fails (no service role, rate limited, network), the invitation row stays
  // in the DB and the admin can share signupUrl manually. The email link
  // takes the user to /auth/callback → /signup (authenticated, so they just
  // set password + display name).
  let emailSent = false;
  let emailError: string | undefined;
  try {
    const admin = createServiceRoleClient();
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/signup')}`;
    const { error } = await admin.auth.admin.inviteUserByEmail(trimmed, { redirectTo });
    if (error) {
      emailError = error.message;
    } else {
      emailSent = true;
    }
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) {
      emailError = 'Service role key not configured — share the signup URL manually.';
    } else {
      throw err;
    }
  }

  // If Supabase rate-limited the email, the auth.users row may or may not
  // exist depending on which side the failure happened. Either way, don't
  // roll back the invitation — admin can share the URL or retry.

  await logAudit({
    action: 'invitation.sent',
    targetType: 'invitation',
    targetId: inserted.id,
    metadata: {
      email: trimmed,
      role,
      client_slug: client_slug ?? null,
      email_sent: emailSent,
      email_error: emailError ?? null,
    },
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  revalidatePath('/admin/demos');
  return { ok: true, signupUrl, emailSent, emailError };
}

export async function revokeInvitation(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  await requirePermission('invite');
  const supabase = await createClient();

  const { data: inv, error: lookupError } = await supabase
    .from('invitations')
    .select('id, email, status')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return { ok: false, error: lookupError.message };
  if (!inv) return { ok: false, error: 'Invitation not found.' };

  // For pending invitations, inviteUserByEmail may have already created a
  // half-formed auth.users row. Cascade the delete so re-inviting the same
  // email later works cleanly — BUT only if no OTHER pending invitations
  // exist for this email (e.g. the user was invited to two demos and we're
  // only revoking one). Cascading the auth-user delete in that case would
  // wipe state that the other pending invite still references.
  let cascadedAuthDelete = false;
  if (inv.status === 'pending') {
    const { count: otherPending } = await supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true })
      .eq('email', inv.email)
      .eq('status', 'pending')
      .neq('id', id);

    if ((otherPending ?? 0) === 0) {
      try {
        const admin = createServiceRoleClient();
        const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
        const target = list?.users.find((u) => u.email?.toLowerCase() === inv.email.toLowerCase());
        if (target) {
          const { error: deleteErr } = await admin.auth.admin.deleteUser(target.id);
          if (deleteErr) return { ok: false, error: `Could not delete pending user: ${deleteErr.message}` };
          cascadedAuthDelete = true;
        }
      } catch (err) {
        if (!(err instanceof MissingServiceRoleKeyError)) throw err;
        // Without service-role we can't delete the auth user; still drop the
        // invitation row so it disappears from the UI.
      }
    }
  }

  const { error: deleteError } = await supabase.from('invitations').delete().eq('id', id);
  if (deleteError) return { ok: false, error: deleteError.message };

  await logAudit({
    action: 'invitation.revoked',
    targetType: 'invitation',
    targetId: id,
    metadata: { email: inv.email, status_at_revoke: inv.status, cascaded_auth_delete: cascadedAuthDelete },
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  revalidatePath('/admin/demos');
  return { ok: true };
}
