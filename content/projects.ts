export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  image?: string;
  github?: string;
  liveUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    slug: "global-entry-notifier",
    title: "Global Entry Appointment Notifier",
    description: "Monitors TSA's Global Entry appointment system and sends real-time notifications when new interview slots open up at your preferred enrollment centers.",
    tags: ["Python", "Automation", "API"],
    featured: true,
  },
  {
    slug: "personal-website",
    title: "Personal Website",
    description: "This website! Built with Next.js, React Three Fiber, and Tailwind CSS. Features an interactive particle field hero, interactive travel globe, and more.",
    tags: ["Next.js", "React Three Fiber", "Tailwind CSS", "TypeScript"],
    featured: true,
  },
];
