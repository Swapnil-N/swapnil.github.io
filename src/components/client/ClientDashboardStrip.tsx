'use client';

import { useState, useTransition } from 'react';
import Badge from '@/components/admin/ui/Badge';
import Button from '@/components/admin/ui/Button';
import RequestChangesModal from './RequestChangesModal';
import { recordClientAction } from '@/app/demo/actions';
import type { Client } from '@/types/client';

export interface ClientStripProps {
  client: {
    id: string;
    slug: string;
    business_name: string;
    // https:// enforced at the server-action layer; still guard before window.open()
    payment_link_url: string | null;
    status: Client['status'];
  };
  isAdmin: boolean;
}

export default function ClientDashboardStrip({ client, isAdmin }: ClientStripProps) {
  const [pending, startTransition] = useTransition();
  const [showChanges, setShowChanges] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  function handleApprove() {
    setFeedback(null);
    startTransition(async () => {
      const res = await recordClientAction({ client_id: client.id, action: 'approve' });
      if (!res.ok) {
        setFeedback({ type: 'error', msg: res.error });
      } else {
        setFeedback({ type: 'success', msg: "Approval noted — we'll be in touch!" });
      }
    });
  }

  function handlePay() {
    // Guard: only proceed if we actually have a URL (handles stale-prop edge case).
    if (!client.payment_link_url) return;
    // Additional defence: ensure it's https before opening
    if (!client.payment_link_url.startsWith('https://')) return;
    window.open(client.payment_link_url, '_blank', 'noopener,noreferrer');
    startTransition(async () => {
      await recordClientAction({ client_id: client.id, action: 'pay_clicked' });
    });
  }

  const showClientActions = !isAdmin && client.status !== 'paid' && client.status !== 'archived';

  return (
    <>
      {/* Sticky strip — sits below the fixed site nav (top-16 = 64px) */}
      <div className="sticky top-16 z-40 bg-surface/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-heading text-sm font-semibold text-foreground truncate">
              {client.business_name}
            </span>
            {isAdmin && <Badge tone="warning">Admin preview</Badge>}
            {client.status === 'paid' && <Badge tone="success">Paid</Badge>}
            {client.status === 'archived' && <Badge tone="neutral">Archived</Badge>}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {feedback && (
              <span className={`text-xs ${feedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                {feedback.msg}
              </span>
            )}
            {showClientActions && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setFeedback(null); setShowChanges(true); }}
                  disabled={pending}
                >
                  Request Changes
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleApprove}
                  disabled={pending}
                >
                  {pending ? 'Saving…' : 'Approve ✓'}
                </Button>
                {client.payment_link_url?.startsWith('https://') && (
                  <Button
                    size="sm"
                    onClick={handlePay}
                    disabled={pending}
                  >
                    Pay
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <RequestChangesModal
        open={showChanges}
        clientId={client.id}
        onClose={() => setShowChanges(false)}
        onSuccess={(msg) => {
          setShowChanges(false);
          setFeedback({ type: 'success', msg });
        }}
      />
    </>
  );
}
