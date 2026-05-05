'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type Result = { ok: true } | { ok: false; error: string };

const SLUG_RE = /^[a-z0-9-]+$/;

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
  if (!SLUG_RE.test(trimSlug)) return { ok: false, error: 'Slug must be lowercase letters, numbers, and hyphens only' };
  if (!trimName) return { ok: false, error: 'Business name is required' };

  const supabase = await createClient();
  const { error } = await supabase.from('clients').insert({ slug: trimSlug, business_name: trimName });
  if (error) return { ok: false, error: error.message };

  await logAudit({ action: 'demo.created', targetType: 'client', metadata: { slug: trimSlug, business_name: trimName } });
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
  if (trimUrl && !trimUrl.startsWith('http')) return { ok: false, error: 'URL must start with http:// or https://' };

  const supabase = await createClient();
  const { error } = await supabase.from('clients').update({ payment_link_url: trimUrl || null }).eq('id', id);
  if (error) return { ok: false, error: error.message };
  await logAudit({ action: 'demo.payment_link_set', targetType: 'client', targetId: id });
  revalidatePath('/admin/demos');
  return { ok: true };
}
