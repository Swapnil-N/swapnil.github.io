'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Alert from '@/components/admin/ui/Alert';
import { createClient } from '@/lib/supabase/client';
import { selfSignup } from './actions';

interface Props {
  initialEmail: string;
}

export default function SignupForm({ initialEmail }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When admin shares /signup?email=X, the email is locked. Without a
  // pre-fill (someone navigated to /signup directly), it's editable as a
  // fallback — they still need to be on the allowlist.
  const emailLocked = !!initialEmail;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!displayName.trim()) { setError('Display name is required.'); return; }

    setPending(true);
    try {
      const res = await selfSignup({
        email: email.trim(),
        password,
        display_name: displayName.trim(),
      });
      if (!res.ok) { setError(res.error); return; }

      // Sign in client-side so the session cookie lands here and the next
      // navigation is authenticated.
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: res.email,
        password,
      });
      if (signInError) {
        setError(`Account created but sign-in failed: ${signInError.message}. Try signing in from /login.`);
        return;
      }

      router.replace(res.redirect);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        readOnly={emailLocked}
        required
        hint={emailLocked ? 'Locked from your invitation.' : undefined}
        className={emailLocked ? 'opacity-70 cursor-not-allowed bg-card' : ''}
      />
      <Input
        label="Display name"
        type="text"
        autoComplete="name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Your name"
        required
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        required
      />
      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}
