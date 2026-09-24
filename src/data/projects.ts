export type Project = {
  /** URL path segment and React Router key */
  slug: string
  title: string
  summary: string
  /** Tech chips shown on the tile / project header */
  stack: string[]
  body: string[]
}

/** Ordered list shown on the home Projects section. */
export const projects: Project[] = [
  {
    slug: 'puppies',
    title: 'Dog Breed Data Collection',
    summary:
      'Fetches dog breed data from The Dog API into SQLite, with a searchable Django API.',
    stack: ['Python', 'Django', 'SQLite', 'REST API'],
    body: [
      'This project fetches dog profiles from a public API called The Dog API, it then stores them in SQLite via the Django ORM. It then exposes a searchable REST API with breed info.',
      'A background script re-queries the Dog API on an interval, handles duplicates and accumulates unique breed data over time.',
    ],
  },
  {
    slug: 'website-builder',
    title: 'Website Builder',
    summary:
      'A website prototype for a client, featuring a visual page builder to allow edits on their side.',
    stack: ['React', 'Vite', 'Puck'],
    body: [
      'This is a Vite + React site that uses Puck as a visual layout manager.',
      'To edit copy and styling click the pen icon in the footer — On save, the page re-renders from the JSON layout generated, this is currently persisted in localStorage at this stage with database integration pending.',
    ],
  },
  {
    slug: 'web-server',
    title: 'Web Server',
    summary: 'Coming Soon',
    stack: [],
    body: ['Coming Soon'],
  },
]

/** Find a project by URL slug, or undefined if the slug is unknown. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
