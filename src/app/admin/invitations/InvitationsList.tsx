'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Badge from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
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
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{success}</div>
      )}
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
                <TD className="text-muted whitespace-nowrap">{new Date(inv.created_at).toLocaleString()}</TD>
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
        onClose={() => setOpen(false)}
        title="Invite a family member"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={send} disabled={pending || !email.trim()}>{pending ? 'Sending…' : 'Send invite'}</Button>
          </>
        }
      >
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="cousin@example.com"
          hint="They'll receive a link to sign up. New users start with the family_member role."
        />
      </Modal>
    </>
  );
}
