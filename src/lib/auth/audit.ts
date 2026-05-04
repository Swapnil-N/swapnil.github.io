import 'server-only';
import { createClient } from '@/lib/supabase/server';

interface LogAuditArgs {
  action: string;
  targetType?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown>;
}

export async function logAudit({ action, targetType, targetId, metadata }: LogAuditArgs): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('audit_log').insert({
      actor_id: user.id,
      action,
      target_type: targetType ?? null,
      target_id: targetId ?? null,
      metadata: metadata ?? null,
    });
  } catch {
    // Audit is best-effort. Never block the caller.
  }
}
