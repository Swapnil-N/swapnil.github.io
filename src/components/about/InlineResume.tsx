'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { experiences, education, skills } from '@content/resume';

const tabs = ['Experience', 'Education', 'Skills'] as const;
type Tab = (typeof tabs)[number];

const experienceData = experiences
  .filter((e) => e.role !== 'B.S. Computer Science')
  .map((e) => ({ title: e.role, org: e.company, period: e.period, description: e.description }));

const educationData = education.map((e) => ({
  title: e.role,
  org: e.company,
  period: e.period,
  description: e.description,
}));

const skillsByCategory = skills.reduce<Record<string, string[]>>((acc, s) => {
  if (!acc[s.category]) acc[s.category] = [];
  acc[s.category].push(s.name);
  return acc;
}, {});

const skillsData = Object.entries(skillsByCategory).map(([category, items]) => ({
  category,
  items,
}));

function EntryList({
  entries,
}: {
  entries: { title: string; org: string; period: string; description: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      {entries.map((entry, i) => (
        <div key={i} className="border-b border-border pb-6 last:border-b-0">
          <h4 className="font-heading font-bold text-lg">{entry.title}</h4>
          <p className="text-muted text-sm">
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
                className="text-sm px-3 py-1 rounded-full border border-border bg-surface"
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
      <div className="flex gap-6 border-b border-border mb-8 relative">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                layoutId="resume-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
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
      <div className="mt-8 flex items-center gap-4">
        <a
          href="/resume.pdf"
          download
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-medium hover:opacity-90 transition-opacity"
        >
          Download Resume (PDF)
        </a>
        <span className="text-sm text-muted">Add your resume.pdf to public/</span>
      </div>
    </div>
  );
}
