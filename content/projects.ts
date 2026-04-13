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
    slug: "personal-website",
    title: "Personal Website",
    description: "This website! Built with Next.js, React Three Fiber, and Tailwind CSS. Features a 3D flyover hero, interactive travel globe, and more.",
    tags: ["Next.js", "React Three Fiber", "Tailwind CSS", "TypeScript"],
    featured: true,
  },
  {
    slug: "example-project",
    title: "Example Project",
    description: "A placeholder project. Replace with your real projects!",
    tags: ["Python", "React"],
  },
];
