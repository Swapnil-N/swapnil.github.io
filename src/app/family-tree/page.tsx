import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserWithRole } from '@/lib/auth/permissions';
import FamilyTreeView from '@/components/family-tree/FamilyTreeView';
import PageTransition from '@/components/layout/PageTransition';
import ManagePanel from './ManagePanel';
import type { Person, Relationship } from '@/types/family';

export const dynamic = 'force-dynamic';

export default async function FamilyTreePage() {
  const auth = await getCurrentUserWithRole();
  if (!auth) {
    redirect('/login?redirect=/family-tree');
  }
  if (!auth.role.can_view_family_tree) {
    redirect('/');
  }

  const supabase = await createClient();
  const [{ data: peopleData }, { data: relData }] = await Promise.all([
    supabase.from('people').select('*').order('first_name'),
    supabase.from('relationships').select('*'),
  ]);
  const people = (peopleData ?? []) as Person[];
  const relationships = (relData ?? []) as Relationship[];

  const canEdit = auth.role.can_edit_family_tree;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
            Family Tree
          </h1>
          <p className="text-muted mb-8">
            Interactive family tree — zoom, pan, and click nodes for details.
          </p>
        </div>

        <div className="h-[calc(100vh-200px)] w-full">
          <FamilyTreeView people={people} relationships={relationships} />
        </div>

        {canEdit && (
          <ManagePanel people={people} relationships={relationships} />
        )}
      </div>
    </PageTransition>
  );
}
