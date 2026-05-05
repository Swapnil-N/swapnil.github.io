'use client';

import { useState } from 'react';
import PeopleTable from './PeopleTable';
import RelationshipsTable from './RelationshipsTable';
import type { Person, Relationship } from '@/types/family';

interface Props {
  people: Person[];
  relationships: Relationship[];
}

type Tab = 'people' | 'relationships';

export default function ManagePanel({ people, relationships }: Props) {
  const [tab, setTab] = useState<Tab>('people');

  return (
    <section className="border-t border-border bg-surface">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">Manage tree</h2>
          <span className="text-xs uppercase tracking-wide text-muted">Editing tools</span>
        </div>

        <div className="mb-4 flex gap-1 border-b border-border">
          <TabButton active={tab === 'people'} onClick={() => setTab('people')}>People</TabButton>
          <TabButton active={tab === 'relationships'} onClick={() => setTab('relationships')}>Relationships</TabButton>
        </div>

        {tab === 'people' && <PeopleTable people={people} />}
        {tab === 'relationships' && (
          <RelationshipsTable relationships={relationships} people={people} />
        )}
      </div>
    </section>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium transition-colors -mb-px border-b-2 ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}
