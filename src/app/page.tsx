'use client';

import dynamic from 'next/dynamic';
import CurrentlySection from '@/components/home/CurrentlySection';

const FlyoverScene = dynamic(() => import('@/components/three/FlyoverScene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-gradient-to-b from-[#1a0a2e] via-[#2d1b4e] to-[#0f0f19]" />
  ),
});

const AnimatedText = dynamic(() => import('@/components/ui/AnimatedText'), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <FlyoverScene />
      <AnimatedText />
      {/* Scroll spacer for the 3D flyover */}
      <div className="relative h-[400vh]" />
      {/* Currently section after the flyover */}
      <div className="relative z-10 bg-surface py-20">
        <CurrentlySection />
      </div>
    </>
  );
}
