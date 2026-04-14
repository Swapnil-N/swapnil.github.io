'use client';

import { motion } from 'framer-motion';

const name = 'Swapnil Napuri';
const tagline = 'Experience Maxer \u00b7 Adventurer';

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function AnimatedText() {
  const nameWords = name.split(' ');

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
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
        className="mt-4 text-lg text-muted"
      >
        {tagline}
      </motion.p>
    </div>
  );
}
