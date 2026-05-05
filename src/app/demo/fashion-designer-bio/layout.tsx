import { gateDemo } from '@/lib/demo/gate';
import ClientDashboardStrip from '@/components/client/ClientDashboardStrip';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { client, isAdmin } = await gateDemo('fashion-designer-bio');
  return (
    <>
      <ClientDashboardStrip client={client} isAdmin={isAdmin} />
      {children}
    </>
  );
}
