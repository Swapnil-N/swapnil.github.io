'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type Result = { ok: true } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9][a-z0-9-]{1,}[a-z0-9]$/;

export async function createDemo({
  slug,
  business_name,
}: {
  slug: string;
  business_name: string;
}): Promise<Result> {
  await requirePermission('manage_users');
  const trimSlug = slug.trim().toLowerCase();
  const trimName = business_name.trim();

  if (!trimSlug) return { ok: false, error: 'Slug is required' };
  if (!SLUG_RE.test(trimSlug)) {
    return { ok: false, error: 'Slug must be 3+ characters: lowercase letters, numbers, hyphens (no leading/trailing hyphens)' };
  }
  if (!trimName) return { ok: false, error: 'Business name is required' };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .insert({ slug: trimSlug, business_name: trimName })
    .select('id')
    .single();
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: 'demo.created',
    targetType: 'client',
    targetId: data.id,
    metadata: { slug: trimSlug, business_name: trimName },
  });
  revalidatePath('/admin/demos');
  revalidatePath('/admin');
  return { ok: true };
}

export async function archiveDemo(id: string): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { error } = await supabase.from('clients').update({ status: 'archived' }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'demo.archived', targetType: 'client', targetId: id });
  revalidatePath('/admin/demos');
  revalidatePath('/admin');
  return { ok: true };
}

export async function markPaid(id: string): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { error } = await supabase.from('clients').update({ status: 'paid' }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'demo.marked_paid', targetType: 'client', targetId: id });
  revalidatePath('/admin/demos');
  revalidatePath('/admin');
  return { ok: true };
}

export async function setPaymentLink(id: string, url: string): Promise<Result> {
  await requirePermission('manage_users');
  const trimUrl = url.trim();
  // Require https — http would allow insecure or phishing URLs in window.open()
  if (trimUrl && !trimUrl.startsWith('https://')) {
    return { ok: false, error: 'URL must start with https://' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('clients')
    .update({ payment_link_url: trimUrl || null })
    .eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'demo.payment_link_set', targetType: 'client', targetId: id });
  revalidatePath('/admin/demos');
  return { ok: true };
}

// Grant an existing user access to a demo. No automated email — admin
// notifies the user via their own channel. (For NEW users without an
// account, use /admin/invitations instead.)
export async function grantAccess({
  client_id,
  user_id,
}: {
  client_id: string;
  user_id: string;
}): Promise<Result> {
  const { user: actor } = await requirePermission('manage_users');
  const supabase = await createClient();

  const { error: insertError } = await supabase
    .from('client_access')
    .insert({ client_id, user_id, granted_by: actor.id });
  if (insertError) {
    if (insertError.code === '23505') {
      return { ok: false, error: 'This user already has access to this demo.' };
    }
    return { ok: false, error: insertError.message };
  }

  await logAudit({
    action: 'demo.access_granted',
    targetType: 'client',
    targetId: client_id,
    metadata: { user_id },
  });
  revalidatePath('/admin/demos');
  return { ok: true };
}

export async function revokeAccess({
  client_id,
  user_id,
}: {
  client_id: string;
  user_id: string;
}): Promise<Result> {
  await requirePermission('manage_users');
  const supabase = await createClient();
  const { error } = await supabase
    .from('client_access')
    .delete()
    .eq('client_id', client_id)
    .eq('user_id', user_id);
  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: 'demo.access_revoked',
    targetType: 'client',
    targetId: client_id,
    metadata: { user_id },
  });
  revalidatePath('/admin/demos');
  return { ok: true };
}
