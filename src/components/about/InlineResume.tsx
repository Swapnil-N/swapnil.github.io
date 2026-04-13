'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabs = ['Experience', 'Education', 'Skills'] as const;
type Tab = (typeof tabs)[number];

const experienceData = [
  {
    title: 'Forward Deployed Engineer',
    org: 'Palantir Technologies',
    period: '2022 — Present',
    description:
      'Building data infrastructure and analytics platforms for Fortune 500 clients. Leading cross-functional teams to deliver mission-critical solutions.',
  },
  {
    title: 'Software Engineer',
    org: 'Tech Startup',
    period: '2020 — 2022',
    description:
      'Full-stack development with React, Node.js, and AWS. Built scalable microservices serving millions of requests daily.',
  },
];

const educationData = [
  {
    title: 'B.S. Computer Science',
    org: 'University of Michigan',
    period: '2016 — 2020',
    description:
      'Focus on distributed systems and machine learning. Teaching assistant for intro CS courses.',
  },
];

const skillsData = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'SQL', 'Java'] },
  { category: 'Frameworks', items: ['React', 'Next.js', 'Node.js', 'Three.js'] },
  { category: 'Cloud', items: ['AWS'] },
  { category: 'Tools', items: ['Docker', 'Git', 'Terraform'] },
];

function EntryList({
  entries,
}: {
  entries: { title: string; org: string; period: string; description: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry, i) => (
        <div key={i} className="border-b border-[var(--color-border)] pb-6 last:border-b-0">
          <h4 className="font-heading font-bold text-lg">{entry.title}</h4>
          <p className="text-[var(--color-muted)] text-sm">
            {entry.org} &middot; {entry.period}
          </p>
          <p className="mt-2 text-sm leading-relaxed">{entry.description}</p>
        </div>
      ))}
    </div>
  );
}

function SkillsList() {
  return (
    <div className="flex flex-col gap-6">
      {skillsData.map((group) => (
        <div key={group.category}>
          <h4 className="font-heading font-bold text-lg mb-2">{group.category}</h4>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <span
                key={item}
                className="text-sm px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InlineResume() {
  const [activeTab, setActiveTab] = useState<Tab>('Experience');

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-[var(--color-border)] mb-8 relative">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="resume-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-primary)]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {activeTab === 'Experience' && <EntryList entries={experienceData} />}
          {activeTab === 'Education' && <EntryList entries={educationData} />}
          {activeTab === 'Skills' && <SkillsList />}
        </motion.div>
      </AnimatePresence>

      {/* Download Button */}
      <div className="mt-10 flex items-center gap-4 flex-wrap">
        <a
          href="/resume.pdf"
          download
          className="inline-block bg-[var(--color-primary)] text-white rounded-xl px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Download Resume
        </a>
        <span className="text-[var(--color-muted)] text-sm">
          TODO: Add your resume.pdf to public/
        </span>
      </div>
    </div>
  );
}
