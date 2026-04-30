'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

        {/* CTA buttons in hero */}
        <div className="absolute inset-0 z-10 flex items-end justify-center pb-32 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 pointer-events-auto"
          >
            <Link href="/about" className="rounded-xl bg-primary text-white font-medium py-3 px-8 hover:opacity-90 transition-opacity text-center">
              View my resume
            </Link>
            <Link href="/travel" className="rounded-xl border border-border text-foreground font-medium py-3 px-8 hover:border-primary hover:text-primary transition-colors text-center">
              See my travels
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path d="M6 9l6 6 6-6" />
          </motion.svg>
        </motion.div>
      </section>

      {/* Currently section */}
      <section className="relative z-10 bg-surface py-20">
        <CurrentlySection />
      </section>

      {/* About Me */}
      <section className="relative z-10 bg-surface py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-8">
            About Me
          </h2>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-muted leading-relaxed mb-6">
              I&apos;m Swapnil — a Forward Deployed Engineer by day and an experience maxer by nature.
              When I&apos;m not building AI-powered tools, you&apos;ll find me chasing adventures around the world,
              hitting the slopes, or exploring a new city&apos;s food scene.
            </p>
            <p className="text-lg text-muted leading-relaxed mb-6">
              I&apos;ve traveled to over 15 countries and counting, from hiking volcanoes in Guatemala to
              celebrating Carnival in Rio. I believe life is about collecting experiences, not things.
            </p>
            <p className="text-lg text-muted leading-relaxed">
              Born and raised in New Jersey, Rutgers alum, now calling New York City home.
              I speak Kannada, Hindi, and enough French to order coffee.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
