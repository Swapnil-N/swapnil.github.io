'use client';
import { useRef, useEffect } from 'react';

export function useScrollProgress(): React.MutableRefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;
          progress.current = maxScroll > 0 ? Math.min(scrollY / maxScroll, 1) : 0;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}
