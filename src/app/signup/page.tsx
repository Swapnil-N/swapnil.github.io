import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';
import { postSignupRedirectFor } from '@/lib/demo/post-signup-redirect';
import PageTransition from '@/components/layout/PageTransition';
import SignupForm from './SignupForm';
import CompleteAccountForm from './CompleteAccountForm';

export const metadata: Metadata = {
  title: 'Create your account · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function SignupPage({ searchParams }: PageProps) {
  const auth = await getCurrentUserWithRole();
  const params = await searchParams;

  // Path B (authenticated, came from Supabase invite email click):
  // /auth/callback established the session and the confirm-trigger created
  // the profile. They land here to set password + display name.
  if (auth) {
    if (auth.profile.display_name) {
      // Already fully set up — send them somewhere useful.
      const supabase = await createClient();
      const target = await postSignupRedirectFor(supabase, auth.user.id);
      redirect(target);
    }

    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Finish setting up</h1>
          <p className="text-muted mb-8">
            Choose a password and display name for <strong className="text-foreground">{auth.user.email}</strong>.
          </p>
          <CompleteAccountForm />
        </div>
      </PageTransition>
    );
  }

  // Path C (admin shared `/signup?email=...` URL): show the form with email
  // pre-filled and locked. The server action validates the allowlist before
  // creating the account — the locked field is just UX, not security.
  if (params.email) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto px-6 py-12">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Create your account</h1>
          <p className="text-muted mb-8">
            Set a password and display name to finish your invitation.
          </p>
          <SignupForm initialEmail={params.email} />
        </div>
      </PageTransition>
    );
  }

  // Bare `/signup` with no auth and no email param: this is never the
  // intended entry point. Redirect to /login with a clear explanation
  // rather than show a form that lets random visitors guess at allowlisted
  // emails.
  redirect('/login?error=signup_invite_only');
}
