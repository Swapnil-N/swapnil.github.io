'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';
import Toggle from '@/components/admin/ui/Toggle';
import Badge from '@/components/admin/ui/Badge';
import Modal from '@/components/admin/ui/Modal';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { PERMISSION_LABELS, type Role } from '@/types/admin';
import { createRole, updateRole, deleteRole } from './actions';

type PermissionField = keyof typeof PERMISSION_LABELS;
const permissionFields: PermissionField[] = Object.keys(PERMISSION_LABELS) as PermissionField[];

interface FormState {
  name: string;
  description: string;
  permissions: Record<PermissionField, boolean>;
}

const emptyForm: FormState = {
  name: '',
  description: '',
  permissions: {
    can_manage_users: false,
    can_manage_roles: false,
    can_invite: false,
    can_edit_people: false,
    can_edit_relationships: false,
    can_view_family_tree: true,
    can_view_audit_log: false,
  },
};

function fromRole(r: Role): FormState {
  return {
    name: r.name,
    description: r.description ?? '',
    permissions: {
      can_manage_users: r.can_manage_users,
      can_manage_roles: r.can_manage_roles,
      can_invite: r.can_invite,
      can_edit_people: r.can_edit_people,
      can_edit_relationships: r.can_edit_relationships,
      can_view_family_tree: r.can_view_family_tree,
      can_view_audit_log: r.can_view_audit_log,
    },
  };
}

export default function RolesGrid({ roles }: { roles: Role[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setCreating(true);
    setError(null);
  }

  function openEdit(role: Role) {
    setForm(fromRole(role));
    setEditing(role);
    setCreating(false);
    setError(null);
  }

  function close() {
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  function submit() {
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      ...form.permissions,
    };
    if (!payload.name) {
      setError('Name is required');
      return;
    }
    startTransition(async () => {
      const res = editing
        ? await updateRole(editing.id, editing.is_system ? { description: payload.description, ...form.permissions } : payload)
        : await createRole(payload);
      if (!res.ok) setError(res.error);
      else close();
    });
  }

  function handleDelete() {
    if (!confirmDelete) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteRole(confirmDelete.id);
      if (!res.ok) setError(res.error);
      setConfirmDelete(null);
    });
  }

  return (
    <>
      {error && !creating && !editing && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ New role</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => (
          <div key={role.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-foreground">{role.name}</h3>
                  {role.is_system && <Badge tone="primary">System</Badge>}
                </div>
                {role.description && <p className="text-sm text-muted mt-1">{role.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => openEdit(role)}>Edit</Button>
                {!role.is_system && (
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(role)}>Delete</Button>
                )}
              </div>
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {permissionFields.map((field) => (
                <li key={field} className={role[field] ? 'text-foreground' : 'text-muted line-through'}>
                  • {PERMISSION_LABELS[field]}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Modal
        open={creating || editing !== null}
        onClose={close}
        title={editing ? `Edit role: ${editing.name}` : 'Create role'}
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={pending}>Cancel</Button>
            <Button onClick={submit} disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={editing?.is_system ?? false}
            hint={editing?.is_system ? 'System role names cannot be renamed.' : undefined}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Permissions</p>
            {permissionFields.map((field) => (
              <label key={field} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-3 py-2">
                <span className="text-sm text-foreground">{PERMISSION_LABELS[field]}</span>
                <Toggle
                  checked={form.permissions[field]}
                  onChange={(next) => setForm({ ...form, permissions: { ...form.permissions, [field]: next } })}
                />
              </label>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete role"
        message={`Permanently delete the "${confirmDelete?.name ?? ''}" role? Users assigned to it will need to be reassigned first.`}
        confirmLabel="Delete role"
        destructive
        loading={pending}
      />
    </>
  );
}
