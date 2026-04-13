'use client';

import dynamic from 'next/dynamic';

const GlobeScene = dynamic(() => import('@/components/three/GlobeScene'), {
  ssr: false,
  loading: () => (
    <div className="h-[60vh] bg-gradient-to-b from-[#1a1a4e] to-[var(--color-surface)] rounded-3xl" />
  ),
});

interface GlobeSectionProps {
  pins: Array<{ lat: number; lng: number; title: string; slug: string }>;
}

export default function GlobeSection({ pins }: GlobeSectionProps) {
  return <GlobeScene pins={pins} />;
}
