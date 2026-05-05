import type { PermissionKey } from '@/types/admin';

// Permissions that grant access to the /admin dashboard. Sidebar visibility
// and the layout-level guard share this list. Family edit permissions live on
// /family-tree, not /admin, so they're intentionally excluded.
export const ADMIN_PERMISSIONS: PermissionKey[] = [
  'manage_users',
  'manage_roles',
  'invite',
  'view_audit_log',
];
