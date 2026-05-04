'use client';

import { useState, useTransition, type FormEvent } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Badge from '@/components/admin/ui/Badge';
import Alert from '@/components/admin/ui/Alert';
import { createClient } from '@/lib/supabase/client';
import { updateOwnProfile } from './actions';
import type { Profile } from '@/types/family';
import type { Role } from '@/types/admin';

interface Props {
  profile: Profile;
  role: Role;
}

type Message = { kind: 'success' | 'error'; text: string };

export default function AccountForm({ profile, role }: Props) {
  const [savePending, startSave] = useTransition();
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [profileMessage, setProfileMessage] = useState<Message | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwPending, setPwPending] = useState(false);
  const [pwMessage, setPwMessage] = useState<Message | null>(null);

  function saveProfile() {
    setProfileMessage(null);
    startSave(async () => {
      const res = await updateOwnProfile({ display_name: displayName });
      setProfileMessage(res.ok ? { kind: 'success', text: 'Saved' } : { kind: 'error', text: res.error });
    });
  }

  async function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMessage(null);
    if (newPassword.length < 8) {
      setPwMessage({ kind: 'error', text: 'Password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ kind: 'error', text: 'Passwords do not match.' });
      return;
    }
    setPwPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setPwMessage({ kind: 'error', text: error.message });
        return;
      }
      setNewPassword('');
      setConfirmPassword('');
      setPwMessage({ kind: 'success', text: 'Password updated.' });
    } finally {
      setPwPending(false);
    }
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

      <section className="space-y-4">
        <h2 className="font-heading text-lg font-bold text-foreground">Profile</h2>
        {profileMessage && <Alert tone={profileMessage.kind}>{profileMessage.text}</Alert>}
        <Input
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="How you want to be shown"
        />
        <Button onClick={saveProfile} disabled={savePending}>
          {savePending ? 'Saving…' : 'Save changes'}
        </Button>
      </section>

      <section>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-foreground">Change password</h2>
            <p className="text-sm text-muted mt-1">You&apos;re already signed in, so no email confirmation is required.</p>
          </div>
          {pwMessage && <Alert tone={pwMessage.kind}>{pwMessage.text}</Alert>}
          <form onSubmit={changePassword} className="space-y-3">
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button type="submit" disabled={pwPending}>
              {pwPending ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
