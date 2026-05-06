'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import { logAudit } from '@/lib/auth/audit';

type ClientActionType = 'approve' | 'request_changes' | 'pay_clicked';
type Result = { ok: true } | { ok: false; error: string };

export async function recordClientAction({
  client_id,
  action,
  message,
}: {
  client_id: string;
  action: ClientActionType;
  message?: string;
}): Promise<Result> {
  const auth = await getCurrentUserWithRole();
  if (!auth) return { ok: false, error: 'Not authenticated' };
  if (auth.profile.disabled) return { ok: false, error: 'Account disabled' };

  const supabase = await createClient();

  // Verify the caller has access to this demo via client_access. The RLS
  // policy on client_actions also blocks unauthorized inserts at the DB level,
  // but an explicit check gives a clear error and prevents logAudit from
  // being called spuriously on failed attempts.
  const { data: access } = await supabase
    .from('client_access')
    .select('client_id')
    .eq('client_id', client_id)
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (!access) return { ok: false, error: 'You do not have access to this demo' };

  const { error } = await supabase.from('client_actions').insert({
    client_id,
    user_id: auth.user.id,
    action,
    message: message ?? null,
  });

  if (error) return { ok: false, error: error.message };

  await logAudit({
    action: `client_action.${action}`,
    targetType: 'client',
    targetId: client_id,
    metadata: message ? { message } : undefined,
  });

  return { ok: true };
}
