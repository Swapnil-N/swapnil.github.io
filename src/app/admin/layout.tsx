import type { Metadata } from 'next';
import { requireAnyPermission } from '@/lib/auth/permissions';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PageTransition from '@/components/layout/PageTransition';
import { ADMIN_PERMISSIONS } from '@/lib/auth/admin-permissions';

export const metadata: Metadata = {
  title: 'Admin · Swapnil Napuri',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireAnyPermission(ADMIN_PERMISSIONS);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Admin</h1>
        <div className="grid gap-8 md:grid-cols-[12rem_1fr]">
          <aside>
            <AdminSidebar role={role} />
          </aside>
          <section>{children}</section>
        </div>
      </div>
    </PageTransition>
  );
}
