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
import type { Client } from '@/types/client';

interface DemoRow extends Client {
  owner_email: string | null;
}

interface Props {
  demos: DemoRow[];
}

const STATUS_TONE = {
  demo: 'primary',
  paid: 'success',
  archived: 'neutral',
} as const;

export default function DemosTable({ demos }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // archive confirm
  const [archiving, setArchiving] = useState<string | null>(null);

  // mark paid confirm
  const [payingId, setPayingId] = useState<string | null>(null);

  // payment link modal
  const [payLinkId, setPayLinkId] = useState<string | null>(null);
  const [payLinkUrl, setPayLinkUrl] = useState('');
  const [payLinkError, setPayLinkError] = useState<string | null>(null);

  function doArchive(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await archiveDemo(id);
      if (!res.ok) setError(res.error);
      setArchiving(null);
    });
  }

  function doMarkPaid(id: string) {
    setError(null);
    startTransition(async () => {
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
    startTransition(async () => {
      const res = await setPaymentLink(payLinkId, payLinkUrl);
      if (!res.ok) {
        setPayLinkError(res.error);
      } else {
        setPayLinkId(null);
      }
    });
  }

  if (demos.length === 0) {
    return <EmptyState title="No demos yet" description='Create one with the "+ New demo" button above.' />;
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
            <TH>Owner</TH>
            <TH>Last active</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {demos.map((demo) => (
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
              <TD className="text-muted text-sm">
                {demo.owner_email ?? <span className="italic">Unclaimed</span>}
              </TD>
              <TD className="text-muted whitespace-nowrap text-sm">
                {demo.last_seen_at ? formatTimestamp(demo.last_seen_at) : '—'}
              </TD>
              <TD>
                <div className="flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openPayLink(demo)}
                    disabled={pending}
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
                        disabled={pending}
                      >
                        Mark paid
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => setArchiving(demo.id)}
                        disabled={pending}
                      >
                        Archive
                      </Button>
                    </>
                  )}
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      <ConfirmDialog
        open={!!archiving}
        title="Archive demo?"
        message="The demo will be hidden from the client. You can restore it via a direct DB update if needed."
        confirmLabel="Archive"
        destructive
        onConfirm={() => archiving && doArchive(archiving)}
        onCancel={() => setArchiving(null)}
      />

      <ConfirmDialog
        open={!!payingId}
        title="Mark as paid?"
        message="This records that the client has paid. The demo will show a 'Paid' badge."
        confirmLabel="Mark paid"
        onConfirm={() => payingId && doMarkPaid(payingId)}
        onCancel={() => setPayingId(null)}
      />

      <Modal
        open={!!payLinkId}
        onClose={() => setPayLinkId(null)}
        title="Set payment link"
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayLinkId(null)} disabled={pending}>Cancel</Button>
            <Button onClick={doSetPayLink} disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
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
            hint="Paste the Stripe Payment Link URL. Leave blank to remove."
          />
        </div>
      </Modal>
    </>
  );
}
