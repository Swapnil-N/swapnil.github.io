'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { now } from '@content/now';

const cards = [
  { icon: '\ud83d\udccd', label: 'Location', value: now.location },
  { icon: '\ud83d\udcbb', label: 'Working on', value: now.workingOn },
  { icon: '\ud83c\udfac', label: 'Watching', value: now.watching },
  {
    icon: '\u2708\ufe0f',
    label: 'Last trip',
    value: now.travelHighlight.label,
    href: `/travel/${now.travelHighlight.slug}`,
  },
] as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function CurrentlySection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="max-w-4xl mx-auto px-6">
      <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-10">
        Currently
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={cardVariants}
            className="bg-surface border border-border rounded-2xl p-6"
          >
            <div className="text-3xl mb-2">{card.icon}</div>
            <p className="text-sm text-muted mb-1">
              {card.label}
            </p>
            {'href' in card && card.href ? (
              <Link
                href={card.href}
                className="text-lg font-semibold text-primary hover:underline"
              >
                {card.value}
              </Link>
            ) : (
              <p className="text-lg font-semibold">{card.value}</p>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
