'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Select from '@/components/admin/ui/Select';
import Badge from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import Alert from '@/components/admin/ui/Alert';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import { formatTimestamp } from '@/lib/format-date';
import { sendInvitation, revokeInvitation } from './actions';
import type { Invitation } from '@/types/family';

interface UnclaimedDemo {
  slug: string;
  business_name: string;
}

interface Props {
  invitations: Invitation[];
  unclaimedDemos: UnclaimedDemo[];
}

type InviteRole = 'family_member' | 'client';

export default function InvitationsList({ invitations, unclaimedDemos }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('family_member');
  const [clientSlug, setClientSlug] = useState('');

  function send() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await sendInvitation({
        email,
        role,
        client_slug: role === 'client' ? clientSlug : undefined,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        const label = role === 'client' ? `client invite for /demo/${clientSlug}` : 'family member invite';
        setSuccess(`Invitation sent to ${email} (${label})`);
        resetForm();
        setOpen(false);
      }
    });
  }

  function resetForm() {
    setEmail('');
    setRole('family_member');
    setClientSlug('');
    setError(null);
  }

  function revoke(id: string) {
    setError(null);
    startTransition(async () => {
      const res = await revokeInvitation(id);
      if (!res.ok) setError(res.error);
    });
  }

  const sendDisabled = pending || !email.trim() || (role === 'client' && !clientSlug);

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
              <TH>Type</TH>
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
                  {inv.client_slug ? (
                    <span className="text-sm text-muted">
                      Client <span className="font-mono text-xs">({inv.client_slug})</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted">Family member</span>
                  )}
                </TD>
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
        onClose={() => { setOpen(false); resetForm(); }}
        title="Send invitation"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setOpen(false); resetForm(); }} disabled={pending}>
              Cancel
            </Button>
            <Button onClick={send} disabled={sendDisabled}>
              {pending ? 'Sending…' : 'Send invite'}
            </Button>
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
            placeholder="person@example.com"
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as InviteRole);
              setClientSlug('');
            }}
          >
            <option value="family_member">Family member — can view family tree</option>
            <option value="client">Client — can view their demo site</option>
          </Select>
          {role === 'client' && (
            <Select
              label="Demo"
              value={clientSlug}
              onChange={(e) => setClientSlug(e.target.value)}
            >
              <option value="">— Select a demo —</option>
              {unclaimedDemos.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.business_name} (/demo/{d.slug})
                </option>
              ))}
            </Select>
          )}
          {role === 'client' && unclaimedDemos.length === 0 && (
            <p className="text-xs text-muted">
              No unclaimed demos available. Create one at{' '}
              <a href="/admin/demos" className="text-primary underline">Admin → Demos</a> first.
            </p>
          )}
          {role === 'family_member' && (
            <p className="text-xs text-muted">
              New users start with the <strong>family_member</strong> role and can view the family tree.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
