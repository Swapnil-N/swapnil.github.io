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

interface DemoOption {
  slug: string;
  business_name: string;
}

interface Props {
  invitations: Invitation[];
  availableDemos: DemoOption[];
  businessNameBySlug: Record<string, string>;
}

type InviteRole = 'family_member' | 'client';

interface InviteResult {
  email: string;
  signupUrl: string;
  emailSent: boolean;
  emailError?: string;
}

export default function InvitationsList({ invitations, availableDemos, businessNameBySlug }: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<InviteResult | null>(null);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<InviteRole>('family_member');
  const [clientSlug, setClientSlug] = useState('');
  const [copied, setCopied] = useState(false);

  function send() {
    setError(null);
    setLastResult(null);
    startTransition(async () => {
      const res = await sendInvitation({
        email,
        role,
        client_slug: role === 'client' ? clientSlug : undefined,
      });
      if (!res.ok) {
        setError(res.error);
      } else {
        setLastResult({
          email,
          signupUrl: res.signupUrl,
          emailSent: res.emailSent,
          emailError: res.emailError,
        });
        resetForm();
        setOpen(false);
      }
    });
  }

  async function copyUrl() {
    if (!lastResult) return;
    try {
      await navigator.clipboard.writeText(lastResult.signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API blocked (insecure context, permissions); user can select manually.
    }
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
      {lastResult && (
        <div className="mb-4">
          <Alert tone="success">
            <div className="space-y-2">
              <div>
                Invitation created for <strong>{lastResult.email}</strong>.
                {lastResult.emailSent
                  ? ' Confirmation email sent.'
                  : ` Email not sent (${lastResult.emailError ?? 'unknown'}). Share the link below manually.`}
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground break-all">
                  {lastResult.signupUrl}
                </code>
                <Button size="sm" variant="ghost" onClick={copyUrl}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>
          </Alert>
        </div>
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
                      <span className="text-foreground">{businessNameBySlug[inv.client_slug] ?? 'Demo'}</span>{' '}
                      <span className="font-mono text-xs">/demo/{inv.client_slug}</span>
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
              {availableDemos.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.business_name} (/demo/{d.slug})
                </option>
              ))}
            </Select>
          )}
          {role === 'client' && availableDemos.length === 0 && (
            <p className="text-xs text-muted">
              No demos exist yet. Create one at{' '}
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
