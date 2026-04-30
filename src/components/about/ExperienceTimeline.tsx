'use client';

import { motion } from 'framer-motion';
import { experiences } from '@content/resume';

export default function ExperienceTimeline() {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 md:left-1/2 w-0.5 h-full bg-primary/20" />

      <div className="flex flex-col gap-12">
        {experiences.map((exp, i) => {
          const isLeft = i % 2 === 0;

          return (
            <div
              key={i}
              className={`relative flex items-start md:items-center ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Dot on the timeline */}
              <div
                className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 z-10"
              />

              {/* Spacer for mobile left offset */}
              <div className="w-10 shrink-0 md:hidden" />

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`bg-surface border border-border rounded-2xl p-6 w-full md:w-[calc(50%-2rem)] ${
                  isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'
                }`}
              >
                <h3 className="font-heading text-xl font-bold">{exp.company}</h3>
                <p className="text-muted text-sm mt-1">
                  {exp.role} &middot; {exp.period} &middot; {exp.location}
                </p>
                <ul className="mt-3 space-y-1.5 ml-4 list-disc">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-sm text-muted leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
