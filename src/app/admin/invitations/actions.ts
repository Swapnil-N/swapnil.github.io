'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';
import { sendEmail } from '@/lib/email/send';
import { invitationEmail } from '@/lib/email/templates';

type Result = { ok: true; loggedOnly?: boolean } | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_DAYS = 7;

async function siteOrigin(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'https';
  const host = h.get('host') ?? '';
  return `${proto}://${host}`;
}

function generateToken(): string {
  // 32 bytes → 43 chars base64url. Plenty of entropy; URL-safe.
  return randomBytes(32).toString('base64url');
}

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

  // Refuse if a user with this email already exists. They should be granted
  // access via the Manage Access UI on /admin/demos, not invited as a new user.
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
    // Without the service-role we can't enumerate auth.users; fall through and
    // rely on the unique-on-email check inside admin.createUser later.
  }

  // Resolve role_id
  const { data: roleRow, error: roleErr } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .maybeSingle();
  if (roleErr || !roleRow) return { ok: false, error: `Role '${role}' not found` };

  // Verify the demo exists if it's a client invite
  let businessName: string | undefined;
  if (role === 'client' && client_slug) {
    const { data: clientRow } = await supabase
      .from('clients')
      .select('slug, business_name')
      .eq('slug', client_slug)
      .maybeSingle();
    if (!clientRow) return { ok: false, error: `Demo '${client_slug}' not found` };
    businessName = clientRow.business_name;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: inserted, error: insertError } = await supabase
    .from('invitations')
    .insert({
      email: trimmed,
      invited_by: user.id,
      role_id: roleRow.id,
      client_slug: client_slug ?? null,
      accept_token: token,
      expires_at: expiresAt,
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
  const acceptUrl = `${origin}/accept-invite?token=${token}`;
  const { subject, html, text } = invitationEmail({
    acceptUrl,
    businessName,
    isClient: role === 'client',
  });
  const sendResult = await sendEmail({ to: trimmed, subject, html, text });

  if (!sendResult.ok) {
    // Rollback the invitation row so the admin can retry without a "duplicate"
    // error (and so we don't have an orphan token sitting in the table).
    await supabase.from('invitations').delete().eq('id', inserted.id);
    return { ok: false, error: `Email failed: ${sendResult.error ?? 'unknown'}` };
  }

  await logAudit({
    action: 'invitation.sent',
    targetType: 'invitation',
    targetId: inserted.id,
    metadata: {
      email: trimmed,
      role,
      client_slug: client_slug ?? null,
      email_logged_only: sendResult.loggedOnly ?? false,
    },
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  revalidatePath('/admin/demos');
  return { ok: true, loggedOnly: sendResult.loggedOnly };
}

export async function revokeInvitation(id: string): Promise<Result> {
  await requirePermission('invite');
  const supabase = await createClient();

  const { data: inv, error: lookupError } = await supabase
    .from('invitations')
    .select('id, email, status')
    .eq('id', id)
    .maybeSingle();
  if (lookupError) return { ok: false, error: lookupError.message };
  if (!inv) return { ok: false, error: 'Invitation not found.' };

  // Token-based invites don't pre-create auth users, so revoke is just a
  // delete of the invitation row. (For accepted invites the row is historical.)
  const { error: deleteError } = await supabase.from('invitations').delete().eq('id', id);
  if (deleteError) return { ok: false, error: deleteError.message };

  await logAudit({
    action: 'invitation.revoked',
    targetType: 'invitation',
    targetId: id,
    metadata: { email: inv.email, status_at_revoke: inv.status },
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  revalidatePath('/admin/demos');
  return { ok: true };
}
