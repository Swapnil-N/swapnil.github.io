import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient, MissingServiceRoleKeyError } from '@/lib/supabase/admin';
import Badge from '@/components/admin/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import EmptyState from '@/components/admin/ui/EmptyState';
import type { Role, AuditLogEntry } from '@/types/admin';

interface RoleBreakdownRow {
  role_id: string;
  count: number;
  name: string;
}

async function loadStats() {
  const supabase = await createClient();

  const [{ count: totalUsers }, { count: disabledUsers }, { count: pendingInvites }, { count: peopleCount }, rolesRes, recentAuditRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('disabled', true),
    supabase.from('invitations').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('people').select('*', { count: 'exact', head: true }),
    supabase.from('roles').select('*').order('name'),
    supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  const roles: Role[] = rolesRes.data ?? [];
  const recentAudit: AuditLogEntry[] = recentAuditRes.data ?? [];

  const { data: profilesByRole } = await supabase
    .from('profiles')
    .select('role_id');
  const breakdown: RoleBreakdownRow[] = roles.map((r) => ({
    role_id: r.id,
    name: r.name,
    count: (profilesByRole ?? []).filter((p) => p.role_id === r.id).length,
  }));

  return {
    totalUsers: totalUsers ?? 0,
    disabledUsers: disabledUsers ?? 0,
    pendingInvites: pendingInvites ?? 0,
    peopleCount: peopleCount ?? 0,
    breakdown,
    recentAudit,
  };
}

interface RecentlyActiveUser {
  id: string;
  email: string;
  last_sign_in_at: string | null;
}

async function loadRecentlyActive(): Promise<{ rows: RecentlyActiveUser[] | null; error: string | null }> {
  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 100 });
    if (error) return { rows: null, error: error.message };
    const rows = (data?.users ?? [])
      .filter((u) => u.last_sign_in_at)
      .sort((a, b) => (b.last_sign_in_at ?? '').localeCompare(a.last_sign_in_at ?? ''))
      .slice(0, 10)
      .map((u) => ({ id: u.id, email: u.email ?? '—', last_sign_in_at: u.last_sign_in_at ?? null }));
    return { rows, error: null };
  } catch (err) {
    if (err instanceof MissingServiceRoleKeyError) {
      return { rows: null, error: 'service_role_missing' };
    }
    throw err;
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="font-heading text-2xl font-bold text-foreground mt-1">{value}</div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const stats = await loadStats();
  const recent = await loadRecentlyActive();

  return (
    <div className="space-y-8">
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <StatCard label="Users" value={stats.totalUsers} />
        <StatCard label="Disabled" value={stats.disabledUsers} />
        <StatCard label="Pending invites" value={stats.pendingInvites} />
        <StatCard label="People" value={stats.peopleCount} />
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Users by role</h2>
        <div className="flex flex-wrap gap-2">
          {stats.breakdown.map((row) => (
            <Badge key={row.role_id} tone="primary">
              {row.name}: {row.count}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Recently active users</h2>
        {recent.error === 'service_role_missing' ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            Set <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in <code className="font-mono">.env.local</code> to see last-sign-in data.
          </div>
        ) : recent.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            Failed to load: {recent.error}
          </div>
        ) : recent.rows && recent.rows.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Last sign-in</TH>
              </TR>
            </THead>
            <TBody>
              {recent.rows.map((u) => (
                <TR key={u.id}>
                  <TD>{u.email}</TD>
                  <TD className="text-muted">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : '—'}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        ) : (
          <EmptyState title="No sign-ins yet" />
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-bold text-foreground mb-3">Recent activity</h2>
        {stats.recentAudit.length === 0 ? (
          <EmptyState title="No audit entries yet" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Action</TH>
                <TH>Target</TH>
              </TR>
            </THead>
            <TBody>
              {stats.recentAudit.map((entry) => (
                <TR key={entry.id}>
                  <TD className="text-muted whitespace-nowrap">{new Date(entry.created_at).toLocaleString()}</TD>
                  <TD className="font-mono text-xs">{entry.action}</TD>
                  <TD className="text-muted">{entry.target_type ?? '—'}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </div>
    </div>
  );
}
