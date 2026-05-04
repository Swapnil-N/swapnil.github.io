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

export default async function ResetPasswordPage() {
  const auth = await getCurrentUserWithRole();
  if (!auth) redirect('/login?redirect=/reset-password');

  return (
    <PageTransition>
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Set a new password</h1>
        <p className="text-muted mb-8">
          Enter a new password for {auth.user.email ?? 'your account'}.
        </p>
        <ResetPasswordForm />
      </div>
    </PageTransition>
  );
}
