'use client';

import { useState, useTransition } from 'react';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import Button from '@/components/admin/ui/Button';
import Select from '@/components/admin/ui/Select';
import Badge from '@/components/admin/ui/Badge';
import Alert from '@/components/admin/ui/Alert';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { formatTimestamp } from '@/lib/format-date';
import { updateUserRole, setUserDisabled, deleteUser } from './actions';
import type { Role } from '@/types/admin';

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role_id: string;
  disabled: boolean;
  last_sign_in_at: string | null;
}

interface UsersTableProps {
  users: UserRow[];
  roles: Role[];
  currentUserId: string;
}

export default function UsersTable({ users, roles, currentUserId }: UsersTableProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  function handleRoleChange(userId: string, roleId: string) {
    setError(null);
    startTransition(async () => {
      const res = await updateUserRole(userId, roleId);
      if (!res.ok) setError(res.error);
    });
  }

  function handleToggleDisabled(user: UserRow) {
    setError(null);
    startTransition(async () => {
      const res = await setUserDisabled(user.id, !user.disabled);
      if (!res.ok) setError(res.error);
    });
  }

  function handleDelete(user: UserRow) {
    setError(null);
    startTransition(async () => {
      const res = await deleteUser(user.id);
      if (!res.ok) setError(res.error);
      setConfirmDelete(null);
    });
  }

  return (
    <>
      {error && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      <Table>
        <THead>
          <TR>
            <TH>User</TH>
            <TH>Role</TH>
            <TH>Last sign-in</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <TR key={user.id} className={user.disabled ? 'opacity-60' : ''}>
                <TD>
                  <div className="font-medium text-foreground">{user.display_name ?? '—'}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </TD>
                <TD>
                  <Select
                    value={user.role_id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={pending || isSelf}
                    aria-label="Role"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </Select>
                </TD>
                <TD className="text-muted whitespace-nowrap">{formatTimestamp(user.last_sign_in_at)}</TD>
                <TD>
                  {user.disabled ? <Badge tone="danger">Disabled</Badge> : <Badge tone="success">Active</Badge>}
                </TD>
                <TD className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleToggleDisabled(user)}
                      disabled={pending || isSelf}
                    >
                      {user.disabled ? 'Enable' : 'Disable'}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setConfirmDelete(user)}
                      disabled={pending || isSelf}
                    >
                      Delete
                    </Button>
                  </div>
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        title="Delete user permanently"
        message={`This will permanently remove ${confirmDelete?.email ?? ''} and all their data. This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        loading={pending}
      />
    </>
  );
}
