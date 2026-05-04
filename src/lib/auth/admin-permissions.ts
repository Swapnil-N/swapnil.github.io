import type { PermissionKey } from '@/types/admin';

// Permissions that grant access to the /admin dashboard. Sidebar visibility
// and the layout-level guard share this list.
export const ADMIN_PERMISSIONS: PermissionKey[] = [
  'manage_users',
  'manage_roles',
  'invite',
  'edit_people',
  'edit_relationships',
  'view_audit_log',
];
