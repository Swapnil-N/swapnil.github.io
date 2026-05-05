import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/auth/permissions';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import EmptyState from '@/components/admin/ui/EmptyState';
import Button from '@/components/admin/ui/Button';
import { formatTimestamp } from '@/lib/format-date';
import type { AuditLogEntry } from '@/types/admin';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  await requirePermission('view_audit_log');
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? '1'));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from('audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  const entries = (data ?? []) as AuditLogEntry[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground">Audit log</h2>
        <p className="text-sm text-muted mt-1">All admin mutations, newest first.</p>
      </div>
      {entries.length === 0 ? (
        <EmptyState title="No audit entries yet" />
      ) : (
        <>
          <Table>
            <THead>
              <TR>
                <TH>When</TH>
                <TH>Actor</TH>
                <TH>Action</TH>
                <TH>Target</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {entries.map((e) => (
                <TR key={e.id}>
                  <TD className="text-muted whitespace-nowrap">{formatTimestamp(e.created_at)}</TD>
                  <TD className="font-mono text-xs text-muted">{e.actor_id ? e.actor_id.slice(0, 8) : '—'}</TD>
                  <TD className="font-mono text-xs">{e.action}</TD>
                  <TD className="text-muted">{e.target_type ?? '—'}</TD>
                  <TD className="font-mono text-xs text-muted max-w-xs truncate">
                    {e.metadata ? JSON.stringify(e.metadata) : '—'}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-muted">Page {page} of {totalPages} · {total} entries</span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link href={`/admin/audit?page=${page - 1}`}>
                  <Button size="sm" variant="secondary">← Previous</Button>
                </Link>
              ) : (
                <Button size="sm" variant="secondary" disabled>← Previous</Button>
              )}
              {page < totalPages ? (
                <Link href={`/admin/audit?page=${page + 1}`}>
                  <Button size="sm" variant="secondary">Next →</Button>
                </Link>
              ) : (
                <Button size="sm" variant="secondary" disabled>Next →</Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
