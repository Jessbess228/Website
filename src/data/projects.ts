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
      'This project fetches dog profiles from The Dog API, stores them in SQLite via the Django ORM, and exposes a searchable REST API for the portfolio.',
      'A background job re-queries the Dog API on a code-configured interval so the collection grows over time instead of being wiped each run.',
    ],
  },
  {
    slug: 'sync',
    title: 'Website Builder',
    summary:
      'A website prototype for a client that has a visual page builder to allow edits on their side.',
    stack: ['React', 'Vite', 'Puck'],
    body: [
      'This is a Vite + React site that uses Puck as a visual layout manager.',
      'To edit copy and styling click the pen icon in the footer — On save, the page re-renders from the JSON layout generated, this is currently persisted in localStorage at this stage with database integration pending.',
    ],
  },
]

/** Find a project by URL slug, or undefined if the slug is unknown. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
