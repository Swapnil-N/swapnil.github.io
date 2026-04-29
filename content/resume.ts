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
    company: 'Nira Energy',
    role: 'Forward Deployed Engineer',
    period: 'Jan 2026 — Present',
    description: 'Spearheading full stack development of AI and data analysis tooling for utility companies, enabling faster research, modeling, and approval of new energy proposals across major US energy markets.',
  },
  {
    company: 'Palantir Technologies',
    role: 'Forward Deployed Engineer',
    period: 'Aug 2023 — Oct 2025',
    description: 'Technical lead on multi-million-dollar VA account. Deployed AI/LLM workflows saving thousands of staff hours, mentored engineers, reduced AWS spend by $300K annually. Collaborated with 1,000+ end users.',
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer Intern',
    period: 'May 2022 — Aug 2022',
    description: 'Built internal operations framework tracking 10M+ changes/day across 5 services in 10+ countries. Reduced debugging time by 500+ minutes/month.',
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer Intern',
    period: 'May 2021 — Aug 2021',
    description: 'Designed regionalized audit log tables storing 6M+ interactions/region/year. Reduced on-call troubleshooting by 600+ minutes/month.',
  },
  {
    company: 'Bank of America',
    role: 'Global Technology Analyst',
    period: 'Jun 2020 — Aug 2020',
    description: 'Forecasted cash demand for nationwide ATM network using ML regression model with 10% MAPE.',
  },
  {
    company: 'Bloomberg L.P.',
    role: 'Software Engineering Intern',
    period: 'Jul 2019 — Aug 2019',
    description: 'Built full stack Django REST API with PostgreSQL and Angular UI to monitor 10,000+ global servers.',
  },
];

export const skills: Skill[] = [
  { name: 'Python', category: 'Languages', featured: true },
  { name: 'Java', category: 'Languages', featured: true },
  { name: 'PySpark', category: 'Languages', featured: true },
  { name: 'SQL', category: 'Languages' },
  { name: 'TypeScript', category: 'Languages' },
  { name: 'HTML/CSS', category: 'Languages' },
  { name: 'React', category: 'Frameworks', featured: true },
  { name: 'Django', category: 'Frameworks' },
  { name: 'Next.js', category: 'Frameworks' },
  { name: 'AWS', category: 'Cloud', featured: true },
  { name: 'Foundry/Ontology', category: 'Tools', featured: true },
  { name: 'Git', category: 'Tools' },
  { name: 'Docker', category: 'Tools' },
  { name: 'DynamoDB', category: 'Tools' },
  { name: 'AI/LLMs', category: 'Tools', featured: true },
];

export const education: Experience[] = [
  {
    company: 'Rutgers University — Honors College',
    role: 'B.S. Computer Science & Finance; Minor in Mathematics',
    period: 'Aug 2019 — May 2023',
    description: 'GPA: 3.90/4.00. President of Quantitative Finance Club. Dean\'s List all semesters. Rock Climbing Club.',
  },
];
