'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Role } from '@/types/admin';
import { roleHasPermission } from '@/lib/auth/permissions.client';
import type { PermissionKey } from '@/types/admin';

interface SidebarLink {
  href: string;
  label: string;
  permission: PermissionKey | null;
}

const links: SidebarLink[] = [
  { href: '/admin', label: 'Overview', permission: null },
  { href: '/admin/users', label: 'Users', permission: 'manage_users' },
  { href: '/admin/roles', label: 'Roles', permission: 'manage_roles' },
  { href: '/admin/invitations', label: 'Invitations', permission: 'invite' },
  { href: '/admin/audit', label: 'Audit log', permission: 'view_audit_log' },
];

interface AdminSidebarProps {
  role: Role;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const visible = links.filter((l) => l.permission === null || roleHasPermission(role, l.permission));

  return (
    <nav className="flex flex-col gap-1">
      {visible.map((link) => {
        const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-foreground hover:bg-card'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
      <div className="mt-4 border-t border-border pt-4">
        <Link
          href="/"
          className="px-3 py-2 block rounded-lg text-sm text-muted hover:text-foreground hover:bg-card transition-colors"
        >
          ← Back to site
        </Link>
      </div>
    </nav>
  );
}
