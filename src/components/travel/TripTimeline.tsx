'use client';

import { motion } from 'framer-motion';
import TripCard from './TripCard';

interface Trip {
  slug: string;
  title: string;
  lat: number;
  lng: number;
  startDate: string;
  excerpt: string;
}

export default function TripTimeline({ trips }: { trips: Trip[] }) {
  return (
    <div className="relative">
      {/* Vertical center line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-[var(--color-primary)] opacity-20" />

      <div className="flex flex-col gap-12">
        {trips.map((trip, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={trip.slug}
              initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
              className={`relative pl-12 md:pl-0 md:w-1/2 ${
                isLeft
                  ? 'md:pr-12 md:self-start'
                  : 'md:pl-12 md:self-end'
              }`}
            >
              {/* Timeline dot */}
              <div
                className={`absolute top-6 w-3 h-3 rounded-full bg-[var(--color-primary)] left-[10px] md:left-auto ${
                  isLeft ? 'md:right-[-6px]' : 'md:left-[-6px]'
                }`}
              />
              <TripCard
                slug={trip.slug}
                title={trip.title}
                startDate={trip.startDate}
                excerpt={trip.excerpt}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
