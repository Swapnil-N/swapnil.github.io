'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';
import Modal from '@/components/admin/ui/Modal';
import Alert from '@/components/admin/ui/Alert';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import EmptyState from '@/components/admin/ui/EmptyState';
import { createPerson, updatePerson, deletePerson } from './actions';
import type { Person } from '@/types/family';

interface FormState {
  first_name: string;
  last_name: string;
  birth_date: string;
  death_date: string;
  photo_url: string;
  bio: string;
}

const empty: FormState = { first_name: '', last_name: '', birth_date: '', death_date: '', photo_url: '', bio: '' };

function fromPerson(p: Person): FormState {
  return {
    first_name: p.first_name,
    last_name: p.last_name ?? '',
    birth_date: p.birth_date ?? '',
    death_date: p.death_date ?? '',
    photo_url: p.photo_url ?? '',
    bio: p.bio ?? '',
  };
}

function toPayload(s: FormState) {
  return {
    first_name: s.first_name.trim(),
    last_name: s.last_name.trim() || null,
    birth_date: s.birth_date || null,
    death_date: s.death_date || null,
    photo_url: s.photo_url.trim() || null,
    bio: s.bio.trim() || null,
  };
}

export default function PeopleTable({ people }: { people: Person[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Person | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Person | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  function openCreate() {
    setForm(empty);
    setCreating(true);
    setEditing(null);
    setError(null);
  }

  function openEdit(p: Person) {
    setForm(fromPerson(p));
    setEditing(p);
    setCreating(false);
    setError(null);
  }

  function close() {
    setCreating(false);
    setEditing(null);
    setError(null);
  }

  function submit() {
    setError(null);
    const payload = toPayload(form);
    if (!payload.first_name) {
      setError('First name is required');
      return;
    }
    startTransition(async () => {
      const res = editing ? await updatePerson(editing.id, payload) : await createPerson(payload);
      if (!res.ok) setError(res.error);
      else close();
    });
  }

  function handleDelete() {
    if (!confirmDelete) return;
    setError(null);
    startTransition(async () => {
      const res = await deletePerson(confirmDelete.id);
      if (!res.ok) setError(res.error);
      setConfirmDelete(null);
    });
  }

  return (
    <>
      {error && !creating && !editing && <div className="mb-4"><Alert tone="error">{error}</Alert></div>}
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate}>+ New person</Button>
      </div>
      {people.length === 0 ? (
        <EmptyState title="No people yet" description="Add the first family member to get started." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Born</TH>
              <TH>Died</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {people.map((p) => (
              <TR key={p.id}>
                <TD>
                  <div className="font-medium text-foreground">{p.first_name} {p.last_name ?? ''}</div>
                  {p.bio && <div className="text-xs text-muted line-clamp-1">{p.bio}</div>}
                </TD>
                <TD className="text-muted whitespace-nowrap">{p.birth_date ?? '—'}</TD>
                <TD className="text-muted whitespace-nowrap">{p.death_date ?? '—'}</TD>
                <TD className="text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => setConfirmDelete(p)}>Delete</Button>
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={creating || editing !== null}
        onClose={close}
        title={editing ? `Edit ${editing.first_name} ${editing.last_name ?? ''}` : 'Add person'}
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={pending}>Cancel</Button>
            <Button onClick={submit} disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Input label="Birth date" type="date" value={form.birth_date} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
            <Input label="Death date" type="date" value={form.death_date} onChange={(e) => setForm({ ...form, death_date: e.target.value })} />
          </div>
          <Input label="Photo URL" value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} placeholder="https://…" />
          <Textarea label="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete person"
        message={`Permanently delete ${confirmDelete?.first_name ?? ''} ${confirmDelete?.last_name ?? ''}? All their relationships will also be removed.`}
        confirmLabel="Delete"
        destructive
        loading={pending}
      />
    </>
  );
}
