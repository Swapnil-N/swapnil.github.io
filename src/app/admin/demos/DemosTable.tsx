'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Badge from '@/components/admin/ui/Badge';
import Button from '@/components/admin/ui/Button';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import Modal from '@/components/admin/ui/Modal';
import Input from '@/components/admin/ui/Input';
import Alert from '@/components/admin/ui/Alert';
import EmptyState from '@/components/admin/ui/EmptyState';
import { formatTimestamp } from '@/lib/format-date';
import { archiveDemo, markPaid, setPaymentLink } from './actions';
import ManageAccessModal, { type AccessUser, type EligibleUser } from './ManageAccessModal';
import type { Client } from '@/types/client';

interface DemoRow extends Client {
  access_users: AccessUser[];
  pending_invitee_emails: string[];
}

interface Props {
  demos: DemoRow[];
  eligibleUsers: EligibleUser[];
}

const STATUS_TONE = {
  demo: 'primary',
  paid: 'success',
  archived: 'neutral',
} as const satisfies Record<Client['status'], 'primary' | 'success' | 'neutral'>;

export default function DemosTable({ demos, eligibleUsers }: Props) {
  const [, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [archiving, setArchiving] = useState<string | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payLinkId, setPayLinkId] = useState<string | null>(null);
  const [payLinkUrl, setPayLinkUrl] = useState('');
  const [payLinkError, setPayLinkError] = useState<string | null>(null);
  const [accessId, setAccessId] = useState<string | null>(null);

  function run(id: string, fn: () => Promise<void>) {
    setError(null);
    setPendingId(id);
    startTransition(async () => {
      await fn();
      setPendingId(null);
    });
  }

  function doArchive(id: string) {
    run(id, async () => {
      const res = await archiveDemo(id);
      if (!res.ok) setError(res.error);
      setArchiving(null);
    });
  }

  function doMarkPaid(id: string) {
    run(id, async () => {
      const res = await markPaid(id);
      if (!res.ok) setError(res.error);
      setPayingId(null);
    });
  }

  function openPayLink(demo: DemoRow) {
    setPayLinkUrl(demo.payment_link_url ?? '');
    setPayLinkError(null);
    setPayLinkId(demo.id);
  }

  function doSetPayLink() {
    if (!payLinkId) return;
    setPayLinkError(null);
    run(payLinkId, async () => {
      const res = await setPaymentLink(payLinkId, payLinkUrl);
      if (!res.ok) {
        setPayLinkError(res.error);
        setPendingId(null);
      } else {
        setPayLinkId(null);
      }
    });
  }

  if (demos.length === 0) {
    return <EmptyState title="No demos yet" description='Create one with the "+ New demo" button above.' />;
  }

  const accessDemo = demos.find((d) => d.id === accessId) ?? null;

  function renderAccessCell(demo: DemoRow) {
    const count = demo.access_users.length;
    const pending = demo.pending_invitee_emails.length;
    if (count === 0 && pending === 0) {
      return <span className="italic">Unclaimed</span>;
    }
    const parts: string[] = [];
    if (count > 0) parts.push(`${count} user${count === 1 ? '' : 's'}`);
    if (pending > 0) parts.push(`${pending} pending`);
    return <span className="text-foreground">{parts.join(' · ')}</span>;
  }

  return (
    <>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}

      <Table>
        <THead>
          <TR>
            <TH>Business</TH>
            <TH>Slug</TH>
            <TH>Status</TH>
            <TH>Access</TH>
            <TH>Last active</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {demos.map((demo) => {
            const rowPending = pendingId === demo.id;
            return (
              <TR key={demo.id}>
                <TD className="font-medium text-foreground">{demo.business_name}</TD>
                <TD>
                  <Link
                    href={`/demo/${demo.slug}`}
                    className="font-mono text-xs text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    /demo/{demo.slug} ↗
                  </Link>
                </TD>
                <TD>
                  <Badge tone={STATUS_TONE[demo.status]}>{demo.status}</Badge>
                </TD>
                <TD className="text-muted text-sm">{renderAccessCell(demo)}</TD>
                <TD className="text-muted whitespace-nowrap text-sm">
                  {demo.last_seen_at ? formatTimestamp(demo.last_seen_at) : '—'}
                </TD>
                <TD>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setAccessId(demo.id)}
                      disabled={rowPending}
                    >
                      Access
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openPayLink(demo)}
                      disabled={rowPending}
                      title="Set payment link"
                    >
                      $ Link
                    </Button>
                    {demo.status === 'demo' && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setPayingId(demo.id)}
                          disabled={rowPending}
                        >
                          Mark paid
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setArchiving(demo.id)}
                          disabled={rowPending}
                        >
                          Archive
                        </Button>
                      </>
                    )}
                  </div>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <ConfirmDialog
        open={!!archiving}
        title="Archive demo?"
        message="The demo will be hidden from the client. You can restore it via a direct DB update if needed."
        confirmLabel="Archive"
        destructive
        loading={pendingId === archiving}
        onConfirm={() => archiving && doArchive(archiving)}
        onCancel={() => setArchiving(null)}
      />

      <ConfirmDialog
        open={!!payingId}
        title="Mark as paid?"
        message="This records that the client has paid. The demo will show a 'Paid' badge."
        confirmLabel="Mark paid"
        loading={pendingId === payingId}
        onConfirm={() => payingId && doMarkPaid(payingId)}
        onCancel={() => setPayingId(null)}
      />

      <Modal
        open={!!payLinkId}
        onClose={() => setPayLinkId(null)}
        title="Set payment link"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayLinkId(null)} disabled={!!pendingId}>
              Cancel
            </Button>
            <Button onClick={doSetPayLink} disabled={!!pendingId}>
              {pendingId === payLinkId ? 'Saving…' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {payLinkError && <Alert tone="error">{payLinkError}</Alert>}
          <Input
            label="Stripe payment link URL"
            type="url"
            value={payLinkUrl}
            onChange={(e) => setPayLinkUrl(e.target.value)}
            placeholder="https://buy.stripe.com/…"
            hint="Must start with https://. Leave blank to remove."
          />
        </div>
      </Modal>

      <ManageAccessModal
        open={!!accessId}
        onClose={() => setAccessId(null)}
        client={accessDemo ? { id: accessDemo.id, business_name: accessDemo.business_name, slug: accessDemo.slug } : null}
        accessUsers={accessDemo?.access_users ?? []}
        pendingInviteeEmails={accessDemo?.pending_invitee_emails ?? []}
        eligibleUsers={eligibleUsers}
      />
    </>
  );
}
