import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import PageTransition from '@/components/layout/PageTransition';
import AcceptInviteForm from './AcceptInviteForm';

export const metadata: Metadata = {
  title: 'Accept invitation · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  const reason = await validateToken(token);
  if (!reason.ok) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Invitation unavailable</h1>
          <p className="text-muted">{reason.error}</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Accept your invitation</h1>
        <p className="text-muted mb-8">
          Setting up an account for <strong className="text-foreground">{reason.email}</strong>
          {reason.clientLabel && <> to view <strong className="text-foreground">{reason.clientLabel}</strong></>}.
        </p>
        <AcceptInviteForm token={token!} email={reason.email} />
      </div>
    </PageTransition>
  );
}

type ValidationResult =
  | { ok: true; email: string; clientLabel: string | null }
  | { ok: false; error: string };

async function validateToken(token: string | undefined): Promise<ValidationResult> {
  if (!token) return { ok: false, error: 'No invitation token provided.' };

  const supabase = await createClient();
  const { data: inv } = await supabase
    .from('invitations')
    .select('email, status, expires_at, client_slug, clients:client_slug(business_name)')
    .eq('accept_token', token)
    .maybeSingle();

  if (!inv) return { ok: false, error: 'This invitation link is invalid or has already been used.' };
  if (inv.status === 'accepted') return { ok: false, error: 'This invitation has already been accepted. Try signing in instead.' };
  if (inv.expires_at && new Date(inv.expires_at) < new Date()) {
    return { ok: false, error: 'This invitation has expired. Ask the admin to send a new one.' };
  }

  // The Supabase typegen treats foreign-key joins as either a single object or
  // an array depending on the relationship; normalize defensively.
  const business = Array.isArray(inv.clients)
    ? (inv.clients[0]?.business_name ?? null)
    : (inv.clients as { business_name: string } | null)?.business_name ?? null;

  return {
    ok: true,
    email: inv.email,
    clientLabel: business ?? (inv.client_slug ? `/demo/${inv.client_slug}` : null),
  };
}
