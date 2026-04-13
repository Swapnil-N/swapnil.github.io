'use client';

import { motion, useScroll, useTransform } from 'framer-motion';

const name = 'Swapnil Nandeshwar';
const tagline = 'Forward Deployed Engineer \u00b7 Traveler \u00b7 Builder';

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function AnimatedText() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const nameWords = name.split(' ');

  return (
    <motion.div
      style={{ opacity }}
      className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
    >
      <h1 className="font-heading text-5xl md:text-7xl font-bold text-center">
        {nameWords.map((word, i) => (
          <motion.span
            key={i}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={wordVariants}
            className="inline-block mr-4 last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-4 text-lg text-[var(--color-muted)]"
      >
        {tagline}
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-sm text-[var(--color-muted)]">
          Scroll to explore
        </span>
        <motion.svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--color-muted)]"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
}
