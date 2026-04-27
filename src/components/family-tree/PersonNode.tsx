'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { Person } from '@/types/family';

function PersonNode({ data }: NodeProps<Person>) {
  const initials = `${data.first_name?.[0] ?? ''}${data.last_name?.[0] ?? ''}`.toUpperCase();
  const fullName = [data.first_name, data.last_name].filter(Boolean).join(' ');
  const birthYear = data.birth_date ? new Date(data.birth_date).getFullYear() : null;
  const deathYear = data.death_date ? new Date(data.death_date).getFullYear() : null;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-lg px-4 py-3 min-w-[180px] cursor-pointer hover:border-primary transition-colors">
      <Handle type="target" position={Position.Top} className="!bg-primary !w-3 !h-3 !border-2 !border-surface" />

      <div className="flex items-center gap-3">
        {data.photo_url ? (
          <Image
            src={data.photo_url}
            alt={fullName}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
            {initials}
          </div>
        )}
        <div>
          <p className="font-heading font-semibold text-sm leading-tight">{fullName}</p>
          {(birthYear || deathYear) && (
            <p className="text-xs text-muted">
              {birthYear ?? '?'} — {deathYear ?? 'present'}
            </p>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-primary !w-3 !h-3 !border-2 !border-surface" />
    </div>
  );
}

export default memo(PersonNode);
