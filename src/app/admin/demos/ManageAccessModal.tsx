'use client';

import { useState, useTransition } from 'react';
import Modal from '@/components/admin/ui/Modal';
import Button from '@/components/admin/ui/Button';
import Select from '@/components/admin/ui/Select';
import Alert from '@/components/admin/ui/Alert';
import { grantAccess, revokeAccess } from './actions';

export interface AccessUser {
  user_id: string;
  email: string;
  display_name: string | null;
}

export interface EligibleUser {
  id: string;
  email: string;
  display_name: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  client: { id: string; business_name: string; slug: string } | null;
  accessUsers: AccessUser[];
  pendingInviteeEmails: string[];
  eligibleUsers: EligibleUser[];
}

export default function ManageAccessModal({
  open,
  onClose,
  client,
  accessUsers,
  pendingInviteeEmails,
  eligibleUsers,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  const accessUserIds = new Set(accessUsers.map((u) => u.user_id));
  const dropdownOptions = eligibleUsers.filter((u) => !accessUserIds.has(u.id));

  function handleGrant() {
    if (!client || !selectedUserId) return;
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await grantAccess({ client_id: client.id, user_id: selectedUserId });
      if (!res.ok) { setError(res.error); return; }
      setSelectedUserId('');
      setSuccess('Access granted. Let the user know via your own channel — no automated email is sent.');
    });
  }

  function handleRevoke(userId: string) {
    if (!client) return;
    setError(null); setSuccess(null);
    startTransition(async () => {
      const res = await revokeAccess({ client_id: client.id, user_id: userId });
      if (!res.ok) { setError(res.error); return; }
      setSuccess('Access revoked.');
    });
  }

  function handleClose() {
    setError(null); setSuccess(null); setSelectedUserId('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={client ? `Manage access — ${client.business_name}` : 'Manage access'}
      footer={<Button variant="ghost" onClick={handleClose} disabled={pending}>Close</Button>}
    >
      <div className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        {success && <Alert tone="success">{success}</Alert>}

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-2">Users with access</h3>
          {accessUsers.length === 0 ? (
            <p className="text-sm text-muted italic">No one yet. Use the form below to grant access to an existing user, or send a fresh invitation from <a className="underline text-primary" href="/admin/invitations">/admin/invitations</a> for a new user.</p>
          ) : (
            <ul className="space-y-1">
              {accessUsers.map((u) => (
                <li key={u.user_id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                  <span className="text-sm text-foreground">
                    {u.display_name ? `${u.display_name} · ` : ''}<span className="text-muted">{u.email}</span>
                  </span>
                  <Button size="sm" variant="danger" onClick={() => handleRevoke(u.user_id)} disabled={pending}>
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {pendingInviteeEmails.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">Pending invitations</h3>
            <ul className="space-y-1">
              {pendingInviteeEmails.map((email) => (
                <li key={email} className="text-sm text-muted bg-card border border-border rounded-lg px-3 py-2">
                  <span className="italic">{email}</span> — manage at <a className="underline text-primary" href="/admin/invitations">/admin/invitations</a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-foreground mb-2">Grant access to an existing user</h3>
          {dropdownOptions.length === 0 ? (
            <p className="text-sm text-muted italic">No other eligible users. Invite a new email from <a className="underline text-primary" href="/admin/invitations">/admin/invitations</a>.</p>
          ) : (
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  label="User"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">— Select a user —</option>
                  {dropdownOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.display_name ? `${u.display_name} (${u.email})` : u.email}
                    </option>
                  ))}
                </Select>
              </div>
              <Button onClick={handleGrant} disabled={pending || !selectedUserId}>
                {pending ? 'Granting…' : 'Grant access'}
              </Button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
