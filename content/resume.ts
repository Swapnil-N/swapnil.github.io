export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
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
    location: 'New York, NY',
    bullets: [
      'Spearheading full stack development of AI and data analysis tooling for utility companies across the country, enabling faster research, modeling, and approval of new energy proposals across major US energy markets',
    ],
  },
  {
    company: 'Palantir Technologies',
    role: 'Forward Deployed Engineer',
    period: 'Aug 2023 — Oct 2025',
    location: 'New York, NY',
    bullets: [
      'Technical lead for multiple projects on a multi-million-dollar VA account, delivering tools that improved healthcare access for hundreds of thousands of veterans and enabling secure outreach the VA previously lacked',
      'Designed and deployed AI/LLM agentic workflows (OpenAI GPT, Anthropic Claude) and complex PySpark/TypeScript pipelines, saving thousands of staff hours and supporting analytics on millions of records',
      'Mentored junior engineers, promoting best practices in data health, cloud cost optimization, and high technical standards while collaborating with 1,000+ end users across engineering, support, clinical, and administrative teams',
      'Optimized AWS resource usage to reduce cloud spend by $300K annually while maintaining national-scale performance and upsold new workflows to expand the team\'s footprint across different parts of the organizations',
    ],
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer Intern',
    period: 'May 2022 — Aug 2022',
    location: 'Seattle, WA',
    bullets: [
      'Architected an internal operations framework with the ability to track on average 10 million changes per day, peaking at 20 million responses across 5 different back-end services in over 10 countries across 3 regions',
      'Reduced diagnosing and debugging time for customer service agents and oncall engineers by over 500 minutes per month by providing a clear timeline of 100+ events regarding customer and accounting enrollment issues',
      'Devised and deployed a search and filterable dashboard to display collected data containing all the necessary information to prevent log diving, allowing a 30% reduction in steps for root cause analysis',
    ],
  },
  {
    company: 'Amazon',
    role: 'Software Development Engineer Intern',
    period: 'May 2021 — Aug 2021',
    location: 'Seattle, WA',
    bullets: [
      'Designed and implemented robust regionalized audit log tables, covering NA, EU, and FE, to store over 6 million user interactions per region per annum regarding changes made to installment programs and product eligibility',
      'Developed multilevel efficient sorting, filtering, and searching mechanisms for the audit tables through crafting advanced SQL queries built upon AWS Aurora Relational Database through a secure EC2 bastion host',
      'Reduced on-call engineers\' time troubleshooting high priority tickets by over 600 minutes per month, and simplified or eliminated redundant but once necessary product manager workflow processes, saving multiple hours per week',
    ],
  },
  {
    company: 'Bank of America',
    role: 'Global Technology Analyst',
    period: 'Jun 2020 — Aug 2020',
    location: 'Charlotte, NC',
    bullets: [
      'Forecasted cash demand for nationwide ATM network using Scikit machine learning regression model (10% MAPE)',
      'Created a facial recognition attendance software and mobile app to auto check-in 1,000+ members for large events',
    ],
  },
  {
    company: 'Bloomberg L.P.',
    role: 'Software Engineering Intern',
    period: 'Jul 2019 — Aug 2019',
    location: 'Dayton, NJ',
    bullets: [
      'Built full stack Django REST API and PostgreSQL time-series DB with Angular UI to monitor 10,000+ global servers',
      'Surfaced server latency, uptime, and weekly/monthly turnover metrics on a dashboard for senior management',
    ],
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
    location: 'New Brunswick, NJ',
    bullets: [
      'GPA: 3.90/4.00 — Dean\'s List all semesters',
      'President of Quantitative Finance Club',
      'Rock Climbing Club member',
      'Coursework: Algorithms, Data Structures, Databases, Computer Architecture, Quantum Computing, Derivatives, Investment Analysis',
    ],
  },
];
