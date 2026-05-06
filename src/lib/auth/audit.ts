import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';

interface LogAuditArgs {
  action: string;
  targetType?: string;
  targetId?: string | null;
  // Audit metadata is admin-only readable (RLS), but callers should still
  // avoid stuffing free-form user content (long bios, etc.) — keep payloads
  // small and structured so the log stays scannable.
  metadata?: Record<string, unknown>;
  // For events triggered by code that runs without a cookie session (e.g.
  // acceptInvite right after creating the user), pass the user id explicitly.
  // The service-role client is used to insert the row.
  actorIdOverride?: string;
}

export async function logAudit({
  action,
  targetType,
  targetId,
  metadata,
  actorIdOverride,
}: LogAuditArgs): Promise<void> {
  try {
    if (actorIdOverride) {
      const admin = createServiceRoleClient();
      await admin.from('audit_log').insert({
        actor_id: actorIdOverride,
        action,
        target_type: targetType ?? null,
        target_id: targetId ?? null,
        metadata: metadata ?? null,
      });
      return;
    }

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
  } catch (err) {
    // Audit is best-effort. Never block the caller.
    if (err instanceof MissingServiceRoleKeyError) return;
  }
}
