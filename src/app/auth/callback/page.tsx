'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// Handles two Supabase email-link flows on a single URL:
//
//   PKCE      — ?code=... in the query string (e.g. password reset, where the
//              verifier was set in this browser when the email was requested).
//              We exchange the code server-side via the JS SDK.
//
//   Implicit  — #access_token=...&refresh_token=...&type=invite in the URL
//              fragment (e.g. inviteUserByEmail, magic links). Fragments
//              never reach the server, so this MUST be handled client-side.
//              The Supabase browser client auto-detects via detectSessionInUrl
//              on init; we just wait for the session to appear.

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createClient();
      const rawNext = params.get('next') ?? '/';
      const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/';

      // PKCE path
      const code = params.get('code');
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exErr) {
          setError('Authentication failed. The link may be expired or already used.');
          setTimeout(() => router.replace('/login?error=auth_failed'), 2500);
          return;
        }
      }

      // Implicit path: poll for session up to ~3s while the SDK processes the
      // URL fragment. (PKCE will already have a session at this point.)
      const start = Date.now();
      while (Date.now() - start < 3000) {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          router.replace(next);
          router.refresh();
          return;
        }
        await new Promise((r) => setTimeout(r, 100));
      }

      setError('No active session detected. The link may be expired.');
      setTimeout(() => router.replace('/login?error=auth_failed'), 2500);
    })();

    return () => { cancelled = true; };
  }, [params, router]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-center px-6">
      <div>
        <p className="text-foreground">Signing you in…</p>
        {error && <p className="text-red-400 text-sm mt-3 max-w-md">{error}</p>}
      </div>
    </div>
  );
}
