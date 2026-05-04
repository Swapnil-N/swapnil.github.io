import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import PageTransition from '@/components/layout/PageTransition';
import AccountForm from './AccountForm';

export const metadata: Metadata = {
  title: 'Account · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const auth = await getCurrentUserWithRole();
  if (!auth) redirect('/login?redirect=/account');

  return (
    <PageTransition>
      <div className="max-w-xl mx-auto px-6 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Account</h1>
        <AccountForm profile={auth.profile} role={auth.role} />
      </div>
    </PageTransition>
  );
}
