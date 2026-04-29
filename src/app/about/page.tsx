import type { Metadata } from 'next';
import PageTransition from '@/components/layout/PageTransition';
import ExperienceTimeline from '@/components/about/ExperienceTimeline';
import SkillsVisualization from '@/components/about/SkillsVisualization';
import { education } from '@content/resume';
import { projects } from '@content/projects';

export const metadata: Metadata = {
  title: 'Resume — Swapnil Napuri',
  description: 'Experience, skills, and resume.',
};

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="min-h-screen max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">Resume</h1>
        <p className="text-muted text-lg mb-8 max-w-2xl">
          Forward Deployed Engineer building AI-powered solutions. Previously at Palantir, Amazon, Bank of America, and Bloomberg.
        </p>

        {/* Resume download at top */}
        <div className="mb-16">
          <a
            href="/Swapnil_Napuri_Resume.pdf"
            download
            className="inline-flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-medium hover:opacity-90 transition-opacity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download Resume
          </a>
        </div>

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

        {/* Education */}
        <section className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">Education</h2>
          <div className="space-y-6">
            {education.map((edu, i) => (
              <div key={i} className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg">{edu.company}</h3>
                <p className="text-muted text-sm mt-1">{edu.role} · {edu.period}</p>
                <p className="text-muted mt-3">{edu.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section className="mb-20">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-10">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.slug} className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-heading font-bold text-lg mb-2">{project.title}</h3>
                <p className="text-muted text-sm mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-primary/10 text-primary text-xs px-2.5 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                {(project.github || project.liveUrl) && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-border">
                    {project.github && (
                      <a href={project.github} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-primary transition-colors">
                        GitHub &rarr;
                      </a>
                    )}
                    {project.liveUrl && (
                      <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-muted hover:text-primary transition-colors">
                        Live &rarr;
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
