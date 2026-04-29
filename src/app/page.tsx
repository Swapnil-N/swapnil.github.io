'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
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

      {/* Explore section */}
      <section className="relative z-10 bg-surface py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6">
            Explore
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/about" className="rounded-xl bg-primary text-white font-medium py-3 px-8 hover:opacity-90 transition-opacity text-center">
              Learn more about me
            </Link>
            <Link href="/travel" className="rounded-xl border border-border text-foreground font-medium py-3 px-8 hover:border-primary hover:text-primary transition-colors text-center">
              See my travels
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
