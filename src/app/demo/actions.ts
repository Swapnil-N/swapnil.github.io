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

  // Only true clients (with a client_access row for this demo) can record
  // actions. Admins previewing a demo never see the buttons in the strip,
  // and even if they tried, this check would refuse — admins bypass demo
  // VISIBILITY via has_permission, but they don't have a client_access row
  // and so don't pass the client_actions_insert RLS policy either. This
  // explicit check just gives a friendlier error and skips the audit log.
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
