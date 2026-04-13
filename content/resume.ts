export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface Skill {
  name: string;
  category: string;
  featured?: boolean;
}

export const experiences: Experience[] = [
  {
    company: 'Palantir Technologies',
    role: 'Forward Deployed Engineer',
    period: '2022 — Present',
    description: 'Building data infrastructure and analytics platforms for Fortune 500 clients. Leading cross-functional teams to deliver mission-critical solutions.',
  },
  {
    company: 'Tech Startup',
    role: 'Software Engineer',
    period: '2020 — 2022',
    description: 'Full-stack development with React, Node.js, and AWS. Built scalable microservices serving millions of requests daily.',
  },
  {
    company: 'University of Michigan',
    role: 'B.S. Computer Science',
    period: '2016 — 2020',
    description: 'Focus on distributed systems and machine learning. Teaching assistant for intro CS courses.',
  },
];

export const skills: Skill[] = [
  { name: 'TypeScript', category: 'Languages', featured: true },
  { name: 'Python', category: 'Languages', featured: true },
  { name: 'SQL', category: 'Languages' },
  { name: 'Java', category: 'Languages' },
  { name: 'React', category: 'Frameworks', featured: true },
  { name: 'Next.js', category: 'Frameworks', featured: true },
  { name: 'Node.js', category: 'Frameworks' },
  { name: 'Three.js', category: 'Frameworks' },
  { name: 'AWS', category: 'Cloud', featured: true },
  { name: 'Docker', category: 'Tools' },
  { name: 'Git', category: 'Tools' },
  { name: 'Terraform', category: 'Tools' },
];

export const education: Experience[] = [
  {
    company: 'University of Michigan',
    role: 'B.S. Computer Science',
    period: '2016 — 2020',
    description: 'Focus on distributed systems and machine learning. Teaching assistant for intro CS courses.',
  },
];
