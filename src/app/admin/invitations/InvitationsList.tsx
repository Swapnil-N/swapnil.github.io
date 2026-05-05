'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Badge from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import Alert from '@/components/admin/ui/Alert';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import { formatTimestamp } from '@/lib/format-date';
import { sendInvitation, revokeInvitation } from './actions';
import type { Invitation } from '@/types/family';

export default function InvitationsList({ invitations }: { invitations: Invitation[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');

  function send() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await sendInvitation(email);
      if (!res.ok) {
        setError(res.error);
      } else {
        setSuccess(`Invitation sent to ${email}`);
        setEmail('');
        setOpen(false);
      }
    });
  }

  function revoke(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await revokeInvitation(id);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <>
      {error && !open && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      {success && <div className="mb-4"><Alert tone="success">{success}</Alert></div>}
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setOpen(true)}>+ Invite</Button>
      </div>

      {invitations.length === 0 ? (
        <p className="text-sm text-muted">No invitations yet.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH>Sent</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {invitations.map((inv) => (
              <TR key={inv.id}>
                <TD className="font-medium text-foreground">{inv.email}</TD>
                <TD>
                  {inv.status === 'pending' ? <Badge tone="warning">Pending</Badge> : <Badge tone="success">Accepted</Badge>}
                </TD>
                <TD className="text-muted whitespace-nowrap">{formatTimestamp(inv.created_at)}</TD>
                <TD className="text-right">
                  {inv.status === 'pending' && (
                    <Button size="sm" variant="danger" onClick={() => revoke(inv.id)} disabled={pending}>
                      Revoke
                    </Button>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={open}
        onClose={() => { setOpen(false); setError(null); }}
        title="Invite a family member"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); setError(null); }} disabled={pending}>Cancel</Button>
            <Button onClick={send} disabled={pending || !email.trim()}>{pending ? 'Sending…' : 'Send invite'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="cousin@example.com"
            hint="They'll receive a link to sign up. New users start with the family_member role."
          />
        </div>
      </Modal>
    </>
  );
}
