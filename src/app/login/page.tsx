'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PageTransition from '@/components/layout/PageTransition';

// Account creation lives at /signup (invite-only, allowlist-enforced). This
// page is sign-in only — the previous signup-mode toggle was redundant with
// the trigger-gated supabase.auth.signUp path and surfaced confusing errors
// to non-invited users. /signup is the single canonical creation path.

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  // Default to /auth/post-login which routes by role (admin/family/client).
  const redirectTo =
    rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/auth/post-login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get('error');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.refresh();
      router.push(redirectTo);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen max-w-md mx-auto px-6 py-12">
        <h1 className="text-4xl font-heading font-bold mb-3 text-foreground">Sign In</h1>
        <p className="text-muted mb-10">Welcome back. Sign in to continue.</p>

        {(error || urlError) && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
            {error
              || (urlError === 'auth_failed' && 'Authentication failed. Please try again.')
              || (urlError === 'disabled' && 'Your account has been disabled. Contact an admin.')
              || (urlError === 'otp_expired' && (
                <>
                  Your reset link expired or was already used.{' '}
                  <Link href="/forgot-password" className="underline">Request a new one.</Link>
                </>
              ))
              || (urlError === 'access_denied' && (
                <>
                  This link is no longer valid.{' '}
                  <Link href="/forgot-password" className="underline">Request a new reset link.</Link>
                </>
              ))
              || (urlError === 'signup_invite_only' && 'Sign-up is invite-only. If you have an invitation, use the link from your admin’s email or shared signup URL.')
              || (urlError === 'no_demo_access' && 'You don’t have access to that demo. Contact your admin if you think this is a mistake.')
              || urlError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-white font-medium py-3 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-muted hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </p>

        <p className="mt-8 text-center text-sm text-muted">
          Sign-up is invite-only. If you&apos;re expecting access, use the link your admin sent you.
        </p>
      </div>
    </PageTransition>
  );
}
