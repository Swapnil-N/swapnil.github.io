'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type Result = { ok: true } | { ok: false; error: string };

// Pragmatic check; full RFC validation belongs to the email provider.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InviteParams {
  email: string;
  role?: 'family_member' | 'client';
  client_slug?: string;
}

export async function sendInvitation({ email, role = 'family_member', client_slug }: InviteParams): Promise<Result> {
  const { user } = await requirePermission('invite');
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) return { ok: false, error: 'Email is required' };
  if (!EMAIL_RE.test(trimmed)) return { ok: false, error: 'Enter a valid email address' };
  if (role === 'client' && !client_slug) return { ok: false, error: 'Select a demo for client invitations' };

  const supabase = await createClient();

  // Resolve role_id
  const { data: roleRow, error: roleErr } = await supabase
    .from('roles')
    .select('id')
    .eq('name', role)
    .maybeSingle();
  if (roleErr || !roleRow) return { ok: false, error: `Role '${role}' not found` };

  // Verify client_slug exists (better error than FK violation)
  if (role === 'client' && client_slug) {
    const { data: clientRow } = await supabase
      .from('clients')
      .select('slug')
      .eq('slug', client_slug)
      .maybeSingle();
    if (!clientRow) return { ok: false, error: `Demo '${client_slug}' not found` };
  }

  const { error: insertError } = await supabase
    .from('invitations')
    .insert({
      email: trimmed,
      invited_by: user.id,
      role_id: roleRow.id,
      client_slug: client_slug ?? null,
    });
  if (insertError) return { ok: false, error: insertError.message };

  let emailDelivered = true;
  let emailError: string | null = null;
  try {
    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(trimmed);
    if (error) {
      emailDelivered = false;
      emailError = error.message;
    }
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) {
      emailDelivered = false;
      emailError = 'Service role key not configured — invitation recorded but email not sent.';
    } else {
      throw err;
    }
  }

  await logAudit({
    action: 'invitation.sent',
    targetType: 'invitation',
    metadata: { email: trimmed, role, client_slug: client_slug ?? null, email_delivered: emailDelivered },
  });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  if (!emailDelivered) {
    return { ok: false, error: emailError ?? 'Email not delivered' };
  }
  return { ok: true };
}

export async function revokeInvitation(id: string): Promise<Result> {
  await requirePermission('invite');
  const supabase = await createClient();
  const { data, error } = await supabase.from('invitations').delete().eq('id', id).select('id');
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) return { ok: false, error: 'Invitation not found.' };
  await logAudit({ action: 'invitation.revoked', targetType: 'invitation', targetId: id });
  revalidatePath('/admin/invitations');
  revalidatePath('/admin');
  return { ok: true };
}
