'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import type { Person } from '@/types/family';

interface Props {
  person: Person;
  onClose: () => void;
}

export default function PersonDetailPanel({ person, onClose }: Props) {
  const fullName = [person.first_name, person.last_name].filter(Boolean).join(' ');
  const initials = `${person.first_name?.[0] ?? ''}${person.last_name?.[0] ?? ''}`.toUpperCase();

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute top-0 right-0 h-full w-80 bg-surface border-l border-border shadow-2xl overflow-y-auto z-50"
    >
      <div className="p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-border transition-colors"
          aria-label="Close detail panel"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="flex flex-col items-center text-center mt-4">
          {person.photo_url ? (
            <Image
              src={person.photo_url}
              alt={fullName}
              width={96}
              height={96}
              unoptimized
              className="w-24 h-24 rounded-full object-cover border-2 border-border mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-2xl font-bold mb-4">
              {initials}
            </div>
          )}

          <h2 className="font-heading text-xl font-bold">{fullName}</h2>

          {(person.birth_date || person.death_date) && (
            <p className="text-sm text-muted mt-1">
              {person.birth_date ? new Date(person.birth_date).toLocaleDateString() : '?'}
              {' — '}
              {person.death_date ? new Date(person.death_date).toLocaleDateString() : 'Present'}
            </p>
          )}
        </div>

        {person.bio && (
          <div className="mt-6">
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-muted mb-2">
              About
            </h3>
            <p className="text-sm leading-relaxed">{person.bio}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
