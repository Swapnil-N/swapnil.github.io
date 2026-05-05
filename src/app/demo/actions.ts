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
