'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Photo {
  src: string;
  alt: string;
}

export default function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () =>
      setActiveIndex((i) =>
        i !== null ? (i - 1 + photos.length) % photos.length : null,
      ),
    [photos.length],
  );
  const next = useCallback(
    () =>
      setActiveIndex((i) =>
        i !== null ? (i + 1) % photos.length : null,
      ),
    [photos.length],
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, close, prev, next]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (activeIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeIndex]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 flex items-center justify-center text-[var(--color-muted)] text-sm hover:opacity-80 transition-opacity cursor-pointer"
          >
            {photo.alt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={close}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-6 right-6 text-white text-3xl hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Close lightbox"
            >
              &times;
            </button>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-6 text-white text-4xl hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Previous photo"
            >
              &#8249;
            </button>

            {/* Active image placeholder */}
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[80vw] max-w-3xl aspect-[4/3] rounded-2xl bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-secondary)]/30 flex items-center justify-center text-white text-lg"
            >
              {photos[activeIndex].alt}
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-6 text-white text-4xl hover:opacity-70 transition-opacity cursor-pointer"
              aria-label="Next photo"
            >
              &#8250;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
