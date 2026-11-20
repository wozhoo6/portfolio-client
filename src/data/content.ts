// All hardcoded copy for the site. Edit here; components only render it.
// Copy comes from the spec's "Content" section (client/docs/superpowers/specs).

export const site = {
  name: 'Warren Tabora',
  title: 'Full Stack Developer / Systems Solutions Analyst',
  /** Set to true once public/resume.pdf exists; the Resume button stays hidden until then. */
  resumeAvailable: false,
}

export const navLinks: { id: string; label: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export const hero = {
  pill: 'Open to full-time, freelance',
  intro: 'I solve real business problems with effective, proven solutions that real users rely on.',
}

export const about = {
  headline: 'Problem solver who builds the whole system',
  paragraphs: [
    "I'm a Full Stack Developer with 2+ years of real-world experience. I started as a backend developer and now work across the full stack, building systems and apps used locally and internationally. I also run SEO and Google Ads for non-profits.",
    "I've loved troubleshooting since my first PC: I kept breaking it and finding a way to fix it. That curiosity led me to a Computer Science degree, and coding became my main way of thinking up solutions.",
  ],
  facts: [
    { label: 'Location', value: 'Rizal, Philippines (GMT+8)' },
    { label: 'Remote work', value: 'Yes' },
    { label: 'Open to', value: 'Full-time, Freelance' },
  ],
}

export type SkillGroup = { group: string; items: string[] }

export const skills: { groups: SkillGroup[]; workStyle: string[] } = {
  groups: [
    { group: 'Languages', items: ['JavaScript', 'PHP', 'Python'] },
    {
      group: 'Frameworks',
      items: ['Laravel', 'CodeIgniter', 'Express', 'React', 'React Native', 'Flutter'],
    },
    { group: 'Databases', items: ['PostgreSQL', 'MySQL', 'Supabase', 'MongoDB', 'Firebase'] },
    {
      group: 'Tools',
      items: [
        'Git',
        'VS Code',
        'WordPress',
        'Power Automate',
        'Power Apps',
        'Google Ads',
        'SEMrush',
        'Ahrefs',
      ],
    },
  ],
  workStyle: ['Problem-solving', 'Initiative', 'Teamwork', 'Communication'],
}

export type ExperienceEntry = {
  role: string
  company: string
  note?: string
  dates: string
  current: boolean
  description: string
}

/** Newest first. */
export const experience: ExperienceEntry[] = [
  {
    role: 'Backend Developer',
    company: 'NetGlobal Solutions Inc.',
    dates: 'Mar 2026 – Present',
    current: true,
    description:
      'Code reviews, feature work and production deployment for a marketplace platform, plus business analysis and QA with cross-functional teams.',
  },
  {
    role: 'Junior Analyst (Developer)',
    company: 'Streamsoft Inc.',
    note: 'part-time',
    dates: '2025 – Present',
    current: true,
    description:
      'Backend development, workflow automation, QA, SEO and Google Ad Grant management to improve site performance and efficiency.',
  },
  {
    role: 'Technical SEO Intern',
    company: 'ExaWeb Corporation',
    dates: 'Mar – Jul 2025',
    current: false,
    description: 'Technical SEO, metadata optimization, reporting and backlink audits.',
  },
]

export type EducationEntry = { level: string; title: string; school: string; dates: string }

/** Newest first. An entry with any empty field is not shown on the page. */
export const education: EducationEntry[] = [
  {
    level: 'College',
    title: 'BS Computer Science',
    school: 'Tomas Claudio Colleges',
    dates: 'Aug 2024 – May 2026',
  },
  {
    level: 'College',
    title: 'BS Computer Science',
    school: 'De La Salle University – Dasmariñas',
    dates: 'Aug 2022 – Apr 2024',
  },
  // Warren fills these in during development; the card stays hidden until every field has text.
  { level: 'High school', title: '', school: '', dates: '' },
]

export type CertificateEntry = { issuer: string; title: string; center: string; year: string }

/** An entry with any empty field is not shown on the page. */
export const certificates: CertificateEntry[] = [
  // TESDA NC II: Warren fills in the title, training center and year during development.
  { issuer: 'TESDA', title: '', center: '', year: '' },
]

export const contact = {
  heading: "Let's work together",
  blurb:
    'Open to full-time roles and freelance projects. Remote-friendly, based in Rizal, Philippines (GMT+8).',
  email: 'warrentabora3410@gmail.com',
  subject: 'Hello Warren, I found your portfolio',
  /** Leave empty until the URL is known; the link is hidden while empty. */
  linkedin: '',
  github: '',
}

export function isComplete(entry: Record<string, string>): boolean {
  return Object.values(entry).every((value) => value.trim() !== '')
}

export function visibleEntries<T extends Record<string, string>>(list: T[]): T[] {
  return list.filter(isComplete)
}
