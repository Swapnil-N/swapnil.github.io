import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';
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

  // Authenticated path (Design B): user clicked Supabase invite email,
  // /auth/callback exchanged the code, the trigger created their profile.
  // They land here to set a password + display name.
  if (auth) {
    if (auth.profile.display_name) {
      // Already fully set up — send them somewhere useful.
      const supabase = await createClient();
      const { data: access } = await supabase
        .from('client_access')
        .select('client:client_id(slug)')
        .eq('user_id', auth.user.id)
        .order('granted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const slug = (access?.client as { slug: string } | { slug: string }[] | null);
      const target = Array.isArray(slug)
        ? (slug[0]?.slug ? `/demo/${slug[0].slug}` : '/family-tree')
        : (slug?.slug ? `/demo/${slug.slug}` : '/family-tree');
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

  // Unauthenticated path (Design C): admin shared the /signup URL. User
  // types email + password + display name. We validate against the
  // invitations allowlist server-side, then call supabase.auth.signUp,
  // which sends Supabase's confirmation email.
  return (
    <PageTransition>
      <div className="max-w-md mx-auto px-6 py-12">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Create your account</h1>
        <p className="text-muted mb-8">
          Sign-up is invite-only. Use the email an admin invited.
        </p>
        <SignupForm initialEmail={params.email ?? ''} />
      </div>
    </PageTransition>
  );
}
