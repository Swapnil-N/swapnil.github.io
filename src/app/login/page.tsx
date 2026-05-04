'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import PageTransition from '@/components/layout/PageTransition';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect');
  const redirectTo = rawRedirect && rawRedirect.startsWith('/') && !rawRedirect.startsWith('//') ? rawRedirect : '/family-tree';

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const urlError = searchParams.get('error');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          setError(signInError.message);
          return;
        }
        router.refresh();
        router.push(redirectTo);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // Two paths back from signUp:
      // 1. Email confirmation required → session is null, user must click link.
      // 2. Auto-confirm enabled → session is set immediately, sign them in.
      if (data.session) {
        router.refresh();
        router.push(redirectTo);
        return;
      }

      setInfo(`Account created. Check ${email} for a confirmation link, then sign in.`);
      setMode('signin');
      setPassword('');
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setMode((prev) => (prev === 'signin' ? 'signup' : 'signin'));
    setError('');
    setInfo('');
  }

  return (
    <PageTransition>
      <div className="min-h-screen max-w-md mx-auto px-6 py-12">
        <h1 className="text-4xl font-heading font-bold mb-3 text-foreground">
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </h1>
        <p className="text-muted mb-10">
          {mode === 'signin'
            ? 'Welcome back. Sign in to continue.'
            : 'Create an account to get started.'}
        </p>

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
              || urlError}
          </div>
        )}

        {info && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-emerald-300 text-sm">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-foreground mb-1.5">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl bg-transparent border border-border px-4 py-3 text-foreground placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
          )}

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
            {loading
              ? mode === 'signin' ? 'Signing in…' : 'Creating account…'
              : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {mode === 'signin' && (
          <p className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-muted hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </p>
        )}

        <p className="mt-8 text-center text-sm text-muted">
          {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:underline font-medium"
          >
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </PageTransition>
  );
}
