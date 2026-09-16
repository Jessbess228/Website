/**
 * data/resume.ts — static resume.
 *
 * Edit this file to update contact info, experience, education, and skills
 */
export const contact = {
  name: 'Jessica Berry',
  email: 'jessicaberrydev@gmail.com',
  phone: '0431283033',
  role: 'Full Stack Developer',
  /**
   * Shown as pills in the hero card: `label` is the visible text, `url` is where
   * the pill goes. Split so a long profile URL can sit behind a short label.
   */
  github: { label: 'github.com/jessbess228', url: 'https://github.com/jessbess228' },
  linkedin: {
    label: 'LinkedIn.com         ',
    url: 'https://www.linkedin.com/in/jessica-berry-6263481b7',
  },
}

export const summary = `I'm Jess — A current computer science student ready to take on challenges and begin my career in Software Engineering. \n\n By using problem-solving and task prioritisation skills I can quickly close any knowledge gaps, this allows me to hit the ground running in any new environment. \n Curiosity drives my interest in learning new skills as I aim to expand my knowledge of front and backend applications.`

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

export type SkillCategory = {
  items: string[]
}

/** Grouped into categories so the resume panel can lay them out as a 2x2 grid. */
export const skillCategories: SkillCategory[] = [
  {
    items: ['Java', 'Python', 'TypeScript', 'SQL', 'JavaScript', 'Rest APIs' , 'Web Sockets',],
  },
  {
    items: ['Git', 'Docker', 'Scripting', 'Unit Testing', 'ETL processes', 'CI/CD pipelines'],
  },
]
