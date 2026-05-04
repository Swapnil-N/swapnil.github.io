import type { PermissionKey, Role } from '@/types/admin';

export function roleHasPermission(role: Role, perm: PermissionKey): boolean {
  switch (perm) {
    case 'manage_users':         return role.can_manage_users;
    case 'manage_roles':         return role.can_manage_roles;
    case 'invite':               return role.can_invite;
    case 'edit_family_tree':     return role.can_edit_family_tree;
    case 'view_family_tree':     return role.can_view_family_tree;
    case 'view_audit_log':       return role.can_view_audit_log;
    default: {
      const _exhaustive: never = perm;
      return _exhaustive;
    }
  }
}
