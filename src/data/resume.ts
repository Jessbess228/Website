export const contact = {
  name: 'Jessica Berry',
  email: 'jessicaberrydev@gmail.com',
  location: 'Sydney, Australia',
  role: 'IT student · Software Engineering',
}

export const summary = `Current computer science student ready to take on challenges and begin my career in Data/Software Engineering. Using problem-solving and task prioritization skills to quickly close any knowledge gaps allows me to hit the ground running in any new environment. Curiosity drives my interest in learning new skills as I aim to expand my knowledge of computer science and more.`

export type ExperienceItem = {
  title: string
  company: string
  dates: string
  bullets: string[]
}

export const experience: ExperienceItem[] = [
  {
    title: 'Software Engineering Intern',
    company: 'Propeller',
    dates: 'Aug 2025 – Feb 2026',
    bullets: [
      'Responsible for the end-to-end creation of a developer tool to enable more efficient querying of a proprietary internal database.',
      'Developed a strong understanding of the software delivery life cycle (SDLC) by collaborating across development, product, and QA teams.',
      'Created bug fixes in the customer-facing core product for both mobile application and web-browser products, following company coding and feature-flag standards to ensure cohesion.',
    ],
  },
  {
    title: 'Winter Intern',
    company: 'DWS',
    dates: 'June 2025 – July 2025',
    bullets: [
      'Learnt about the large-scale system migration process undertaken by NSW Registry of Births, Deaths and Marriages from the perspective of different stakeholders.',
      'Learnt about the CI/CD pipelines and testing process required for software engineering in a Java-oriented environment.',
    ],
  },
]

export const education = {
  degree: 'Bachelor of Information Technology',
  school: 'Macquarie University',
  dates: '2023 - 2026',
  note: 'Graduating Oct 2026',
}

export const skills = [
  'Java',
  'Python',
  'TypeScript',
  'REST APIs',
  'SQL',
  'Web Sockets',
  'Docker',
  'Unit Testing',
  'Git',
  'Scripting',
  'ETL processes',
  'Adonis',
]
