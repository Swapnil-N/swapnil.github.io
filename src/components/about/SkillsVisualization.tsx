'use client';

import { motion } from 'framer-motion';
import { useCallback, useRef } from 'react';
import { skills, type Skill } from '@content/resume';

const categoryColors: Record<string, string> = {
  Languages: 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]',
  Frameworks: 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]',
  Cloud: 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]',
  Tools: 'bg-[var(--color-muted)]/30 text-[var(--color-foreground)]',
};

function SkillCard({
  skill,
  index,
}: {
  skill: Skill;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    // Only apply tilt for fine pointer (mouse, not touch)
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      className={skill.featured ? 'col-span-2' : ''}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="rounded-xl border border-[var(--color-border)] p-4 text-center h-full"
        style={{ transition: 'transform 0.15s ease' }}
      >
        <span
          className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2 ${
            categoryColors[skill.category] ?? ''
          }`}
        >
          {skill.category}
        </span>
        <p className="font-bold text-lg">{skill.name}</p>
      </div>
    </motion.div>
  );
}

export default function SkillsVisualization() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {skills.map((skill, i) => (
        <SkillCard key={skill.name} skill={skill} index={i} />
      ))}
    </div>
  );
}
