'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Badge from '@/components/admin/ui/Badge';
import Alert from '@/components/admin/ui/Alert';
import { updateOwnProfile, requestPasswordReset } from './actions';
import type { Profile } from '@/types/family';
import type { Role } from '@/types/admin';

interface Props {
  profile: Profile;
  role: Role;
}

export default function AccountForm({ profile, role }: Props) {
  const [pending, startTransition] = useTransition();
  const [resetPending, startResetTransition] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [message, setMessage] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  function save() {
    setMessage(null);
    startTransition(async () => {
      const res = await updateOwnProfile({ display_name: displayName, avatar_url: avatarUrl });
      setMessage(res.ok ? { kind: 'success', text: 'Saved' } : { kind: 'error', text: res.error });
    });
  }

  function resetPassword() {
    setMessage(null);
    startResetTransition(async () => {
      const res = await requestPasswordReset();
      setMessage(
        res.ok
          ? { kind: 'success', text: 'Password reset email sent. Check your inbox.' }
          : { kind: 'error', text: res.error },
      );
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <div>
          <span className="text-xs uppercase tracking-wide text-muted">Email</span>
          <p className="text-foreground">{profile.email}</p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wide text-muted">Role</span>
          <p><Badge tone="primary">{role.name}</Badge></p>
        </div>
      </div>

      {message && (
        <Alert tone={message.kind === 'success' ? 'success' : 'error'}>{message.text}</Alert>
      )}

      <div className="space-y-4">
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want to be shown"
        />
        <Input
          label="Avatar URL"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://…"
        />
        <Button onClick={save} disabled={pending}>{pending ? 'Saving…' : 'Save changes'}</Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading font-bold text-foreground">Password</h3>
        <p className="text-sm text-muted mt-1 mb-3">Send a reset link to your email.</p>
        <Button variant="secondary" onClick={resetPassword} disabled={resetPending}>
          {resetPending ? 'Sending…' : 'Send password reset email'}
        </Button>
      </div>
    </div>
  );
}
