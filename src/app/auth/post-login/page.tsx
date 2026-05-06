import { redirect } from 'next/navigation';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import { createClient } from '@/lib/supabase/server';
import { postSignupRedirectFor } from '@/lib/demo/post-signup-redirect';

export const dynamic = 'force-dynamic';

// Smart post-sign-in router. Decides where to land the user based on what
// they can actually do — admins go to the admin shell, family members to
// /family-tree, clients to their demo (or /demos if they have multiple).
//
// Used as the default `redirect` target after sign-in (replacing the old
// hard-coded `/family-tree` default that sent clients to a page they don't
// have permission for).
export default async function PostLoginPage() {
  const auth = await getCurrentUserWithRole();
  if (!auth) redirect('/login');
  if (auth.profile.disabled) redirect('/login?error=disabled');

  if (auth.role.can_manage_users) redirect('/admin');
  if (auth.role.can_view_family_tree) redirect('/family-tree');

  const supabase = await createClient();
  const target = await postSignupRedirectFor(supabase, auth.user.id);
  redirect(target);
}
