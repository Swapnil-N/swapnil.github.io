import PageTransition from '@/components/layout/PageTransition';
import ExperienceTimeline from '@/components/about/ExperienceTimeline';
import SkillsVisualization from '@/components/about/SkillsVisualization';
import InlineResume from '@/components/about/InlineResume';

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">About Me</h1>
        <p className="text-muted text-lg mb-16 max-w-2xl">
          Forward Deployed Engineer at Palantir. I build things, travel the world, and occasionally
          write about it.
        </p>

        {/* Experience Timeline */}
        <section className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">Experience</h2>
          <ExperienceTimeline />
        </section>

        {/* Skills */}
        <section className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">
            Skills &amp; Tech Stack
          </h2>
          <SkillsVisualization />
        </section>

        {/* Resume */}
        <section className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">Resume</h2>
          <InlineResume />
        </section>
      </div>
    </PageTransition>
  );
}
