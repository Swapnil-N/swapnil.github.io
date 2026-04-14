'use client';

import dynamic from 'next/dynamic';
import CurrentlySection from '@/components/home/CurrentlySection';
import AnimatedText from '@/components/ui/AnimatedText';

const ParticleField = dynamic(() => import('@/components/three/ParticleField'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-to-b from-[#1a0a2e] to-surface" />
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative h-screen overflow-hidden">
        <ParticleField />
        <AnimatedText />
      </section>

      {/* Currently section */}
      <section className="relative z-10 bg-surface py-20">
        <CurrentlySection />
      </section>
    </div>
  );
}
