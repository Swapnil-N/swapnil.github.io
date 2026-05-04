export type PermissionKey =
  | 'manage_users'
  | 'manage_roles'
  | 'invite'
  | 'edit_people'
  | 'edit_relationships'
  | 'view_family_tree'
  | 'view_audit_log';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  can_manage_users: boolean;
  can_manage_roles: boolean;
  can_invite: boolean;
  can_edit_people: boolean;
  can_edit_relationships: boolean;
  can_view_family_tree: boolean;
  can_view_audit_log: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  actor_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export const PERMISSION_LABELS: Record<keyof Omit<Role, 'id' | 'name' | 'description' | 'is_system' | 'created_at'>, string> = {
  can_manage_users: 'Manage users',
  can_manage_roles: 'Manage roles',
  can_invite: 'Send invitations',
  can_edit_people: 'Edit family members',
  can_edit_relationships: 'Edit relationships',
  can_view_family_tree: 'View family tree',
  can_view_audit_log: 'View audit log',
};
