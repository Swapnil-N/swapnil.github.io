import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import PageTransition from '@/components/layout/PageTransition';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Reset password · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ next?: string }>;
}

// Only allow same-origin paths to prevent open-redirect via the next= param.
function safeNext(raw: string | undefined): string {
  if (!raw) return '/family-tree';
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : '/family-tree';
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const auth = await getCurrentUserWithRole();
  const params = await searchParams;
  const next = safeNext(params.next);

  if (!auth) redirect(`/login?redirect=/reset-password${params.next ? `?next=${encodeURIComponent(params.next)}` : ''}`);

  return (
    <PageTransition>
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Set a new password</h1>
        <p className="text-muted mb-8">
          Enter a new password for {auth.user.email ?? 'your account'}.
        </p>
        <ResetPasswordForm next={next} />
      </div>
    </PageTransition>
  );
}
