import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import PageTransition from '@/components/layout/PageTransition';

export const metadata: Metadata = {
  title: 'Your demos · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

// Landing page for authenticated users to find the demos they can see.
// Used when an authed user without admin permissions tries to visit a demo
// they don't have access to (gateDemo redirects them here), or when an
// invitee with no demos lands on /family-tree but actually wants /demo/X.
export default async function DemosIndexPage({ searchParams }: PageProps) {
  const auth = await getCurrentUserWithRole();
  if (!auth) redirect('/login?redirect=/demos');
  if (auth.profile.disabled) redirect('/login?error=disabled');

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('client_access')
    .select('client:client_id(slug, business_name, status)')
    .eq('user_id', auth.user.id)
    .order('granted_at', { ascending: false });

  type Demo = { slug: string; business_name: string; status: 'demo' | 'paid' | 'archived' };
  const demos: Demo[] = (rows ?? [])
    .flatMap((r) => {
      const c = r.client as Demo | Demo[] | null;
      return Array.isArray(c) ? c : c ? [c] : [];
    })
    .filter((d) => d.status !== 'archived');

  const params = await searchParams;
  const error = params.error;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Your demos</h1>
        {error === 'no_access' && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-300 text-sm">
            You don&apos;t have access to that demo. If you think this is a mistake, contact your admin.
          </div>
        )}
        {demos.length === 0 ? (
          <p className="text-muted">
            You don&apos;t have any active demos yet. If you were invited, ask your admin to confirm
            access.
          </p>
        ) : (
          <ul className="space-y-3">
            {demos.map((d) => (
              <li key={d.slug}>
                <Link
                  href={`/demo/${d.slug}`}
                  className="block rounded-xl border border-border bg-card hover:border-primary transition-colors px-5 py-4"
                >
                  <div className="font-heading text-lg font-semibold text-foreground">{d.business_name}</div>
                  <div className="font-mono text-xs text-muted mt-1">/demo/{d.slug}</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
