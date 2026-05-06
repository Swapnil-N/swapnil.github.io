'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Handles two Supabase email-link flows on a single URL:
//
//   PKCE      — ?code=... in the query string (e.g. password reset, where the
//              verifier was set in this browser when the email was requested).
//              We exchange the code via the JS SDK from the browser.
//
//   Implicit  — #access_token=...&refresh_token=...&type=invite in the URL
//              fragment (e.g. inviteUserByEmail, magic links). Fragments
//              never reach the server, so this MUST be handled client-side.
//              The Supabase browser client auto-detects via detectSessionInUrl
//              on init; we wait for the session to appear in cookies.

const POLL_TIMEOUT_MS = 6000;

function readFragmentError(): string | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const err = params.get('error_description') || params.get('error');
  return err ? decodeURIComponent(err.replace(/\+/g, ' ')) : null;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const handle = useCallback(async () => {
    setError(null);
    try {
      const supabase = createClient();
      const rawNext = params.get('next') ?? '/';
      const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

      // Surface Supabase-side failures encoded in the URL fragment up front.
      const fragmentErr = readFragmentError();
      if (fragmentErr) {
        setError(fragmentErr);
        return;
      }

      // PKCE: ?code= in query (e.g. password reset). Manual exchange.
      const code = params.get('code');
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) {
          setError('The link is expired or has already been used. Try requesting a new one.');
          return;
        }
      }

      // Both flows: poll for session up to POLL_TIMEOUT_MS while the SDK
      // settles cookies (implicit-flow detection happens during AuthProvider
      // init in the layout — usually done before we get here).
      const start = Date.now();
      while (Date.now() - start < POLL_TIMEOUT_MS) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace(next);
          router.refresh();
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      setError("We couldn't find an active session. Try the link again, or sign in.");
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error.');
    }
  }, [params, router]);

  useEffect(() => {
    // The async handle() polls for a session and surfaces the result via
    // setError on failure; on success it navigates away. The "no setState
    // in effect" rule doesn't have a clean alternative for this on-mount
    // async-then-update pattern (a subscription model would be overkill).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void handle();
  }, [handle, attempt]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-center px-6">
      <div className="max-w-md">
        {error ? (
          <>
            <p className="text-red-400 text-sm">{error}</p>
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button
                onClick={() => setAttempt((a) => a + 1)}
                className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-card transition-colors"
              >
                Try again
              </button>
              <Link href="/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <p className="text-foreground">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
