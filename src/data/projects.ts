export type Project = {
  /** URL path segment and React Router key */
  slug: string
  title: string
  summary: string
  /** Tech chips shown on the tile / project header */
  stack: string[]
  body: string[]
  /**
   * If set, the home tile is a normal link to this path (full navigation)
   * instead of a React Router route. Used for the Sync app, which lives at
   * /sync/ on the same origin rather than inside this SPA.
   */
  href?: string
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
    href: '/sync/',
    body: [
      'Sync Consulting is a standalone Vite + React marketing site with a full Puck visual layout manager.',
      'Open Admin on the embedded site to drag blocks, edit copy and styling, then save — the public page re-renders from the same JSON layout (persisted in localStorage).',
    ],
  },
]

/** Find a project by URL slug, or undefined if the slug is unknown. */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
