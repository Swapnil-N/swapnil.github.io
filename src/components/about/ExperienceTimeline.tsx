'use client';

import { motion } from 'framer-motion';

const experiences = [
  {
    company: 'Palantir Technologies',
    role: 'Forward Deployed Engineer',
    period: '2022 — Present',
    description:
      'Building data infrastructure and analytics platforms for Fortune 500 clients. Leading cross-functional teams to deliver mission-critical solutions.',
  },
  {
    company: 'Tech Startup',
    role: 'Software Engineer',
    period: '2020 — 2022',
    description:
      'Full-stack development with React, Node.js, and AWS. Built scalable microservices serving millions of requests daily.',
  },
  {
    company: 'University of Michigan',
    role: 'B.S. Computer Science',
    period: '2016 — 2020',
    description:
      'Focus on distributed systems and machine learning. Teaching assistant for intro CS courses.',
  },
];

export default function ExperienceTimeline() {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 md:left-1/2 w-0.5 h-full bg-[var(--color-primary)]/20" />

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
                className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-[var(--color-primary)] -translate-x-1/2 top-6 md:top-1/2 md:-translate-y-1/2 z-10"
              />

              {/* Spacer for mobile left offset */}
              <div className="w-10 shrink-0 md:hidden" />

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 w-full md:w-[calc(50%-2rem)] ${
                  isLeft ? 'md:mr-auto md:pr-6' : 'md:ml-auto md:pl-6'
                }`}
              >
                <h3 className="font-heading text-xl font-bold">{exp.company}</h3>
                <p className="text-[var(--color-muted)] text-sm mt-1">
                  {exp.role} &middot; {exp.period}
                </p>
                <p className="mt-3 text-sm leading-relaxed">{exp.description}</p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
