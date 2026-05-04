'use client';

import { useState, useTransition } from 'react';
import Button from '@/components/admin/ui/Button';
import Select from '@/components/admin/ui/Select';
import Modal from '@/components/admin/ui/Modal';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { Table, THead, TBody, TR, TH, TD } from '@/components/admin/ui/Table';
import EmptyState from '@/components/admin/ui/EmptyState';
import { createRelationship, deleteRelationship } from './actions';
import type { Person, Relationship } from '@/types/family';

const TYPES: Relationship['relationship_type'][] = ['parent', 'child', 'spouse', 'sibling'];

interface FormState {
  person_id: string;
  related_person_id: string;
  relationship_type: Relationship['relationship_type'];
}

const empty: FormState = { person_id: '', related_person_id: '', relationship_type: 'parent' };

export default function RelationshipsTable({
  relationships,
  people,
}: {
  relationships: Relationship[];
  people: Person[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Relationship | null>(null);
  const [form, setForm] = useState<FormState>(empty);

  const peopleMap = new Map(people.map((p) => [p.id, `${p.first_name} ${p.last_name ?? ''}`.trim()]));

  function openCreate() {
    setForm({ ...empty, person_id: people[0]?.id ?? '', related_person_id: people[1]?.id ?? '' });
    setOpen(true);
    setError(null);
  }

  function submit() {
    setError(null);
    if (!form.person_id || !form.related_person_id) {
      setError('Both people are required');
      return;
    }
    startTransition(async () => {
      const res = await createRelationship(form);
      if (!res.ok) setError(res.error);
      else setOpen(false);
    });
  }

  function handleDelete() {
    if (!confirmDelete) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteRelationship(confirmDelete.id);
      if (!res.ok) setError(res.error);
      setConfirmDelete(null);
    });
  }

  return (
    <>
      {error && !open && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}
      <div className="mb-4 flex justify-end">
        <Button onClick={openCreate} disabled={people.length < 2}>+ New relationship</Button>
      </div>
      {relationships.length === 0 ? (
        <EmptyState title="No relationships yet" description="Add at least two people first, then connect them." />
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Person</TH>
              <TH>Type</TH>
              <TH>Related to</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {relationships.map((r) => (
              <TR key={r.id}>
                <TD className="font-medium text-foreground">{peopleMap.get(r.person_id) ?? r.person_id}</TD>
                <TD className="text-muted">{r.relationship_type}</TD>
                <TD className="text-foreground">{peopleMap.get(r.related_person_id) ?? r.related_person_id}</TD>
                <TD className="text-right">
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(r)} disabled={pending}>Delete</Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add relationship"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Cancel</Button>
            <Button onClick={submit} disabled={pending}>{pending ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>
          )}
          <Select
            label="Person"
            value={form.person_id}
            onChange={(e) => setForm({ ...form, person_id: e.target.value })}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name ?? ''}</option>
            ))}
          </Select>
          <Select
            label="Relationship type"
            value={form.relationship_type}
            onChange={(e) => setForm({ ...form, relationship_type: e.target.value as Relationship['relationship_type'] })}
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select
            label="Related to"
            value={form.related_person_id}
            onChange={(e) => setForm({ ...form, related_person_id: e.target.value })}
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.first_name} {p.last_name ?? ''}</option>
            ))}
          </Select>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete relationship"
        message="Remove this relationship? This won't delete either person."
        confirmLabel="Delete"
        destructive
        loading={pending}
      />
    </>
  );
}
