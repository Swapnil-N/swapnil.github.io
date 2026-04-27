import type { Metadata } from 'next';
import { projects } from '@content/projects';
import ProjectCard from '@/components/projects/ProjectCard';
import PageTransition from '@/components/layout/PageTransition';

export const metadata: Metadata = {
  title: 'Projects — Swapnil Napuri',
  description: "Things I've built, contributed to, and am working on.",
};

export default function ProjectsPage() {
  return (
    <PageTransition>
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">Projects</h1>
        <p className="text-muted text-lg mb-12 max-w-2xl">
          Things I&apos;ve built, contributed to, and am working on.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.slug} project={project} index={i} />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
