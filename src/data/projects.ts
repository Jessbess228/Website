/** Optional titled block for project pages that need subheadings. */
export type ProjectSection = {
  subtitle: string
  body: string
}

/**
 * Portfolio project entry.
 * - `slug` becomes the URL path (`/puppies`, `/this-website`, …)
 * - Prefer `sections` for titled content, or `body` for plain paragraphs
 */
export type Project = {
  slug: string
  title: string
  summary: string
  stack: string[]
  body: string[]
  sections?: ProjectSection[]
}

export const projects: Project[] = [
  {
    slug: 'puppies',
    title: 'Dog Breed Data Collection',
    summary:
      'Fetches dog breed data from The Dog API into SQLite, with a searchable Django API.',
    stack: ['Python', 'Django', 'SQLite', 'REST API'],
    // Shown on PuppiesPage above the live search UI
    body: [
      'This project fetches dog profiles from The Dog API, stores them in SQLite via the Django ORM, and exposes a searchable REST API for the portfolio.',
      'A background job re-queries the Dog API on a code-configured interval so the collection grows over time instead of being wiped each run.',
    ],
  },
  {
    slug: 'this-website',
    title: 'This website',
    summary:
      'Personal portfolio on EC2 — React frontend, Caddy reverse proxy, and a Django API for the puppies project.',
    stack: ['React', 'TypeScript', 'Vite', 'Caddy', 'EC2'],
    body: [],
    // Rendered by ProjectPage via the sections branch
    sections: [
      {
        subtitle: 'What it is',
        body:
          'This site is my portfolio: a Vite + React + TypeScript frontend with MUI, deployed on Amazon EC2 behind Caddy. Project pages and the resume live in the static build; the dog-breed explorer talks to a sibling Django API on the same host through path-based reverse proxying.',
      },
      {
        subtitle: 'Running it in production',
        body:
          'Caddy terminates public traffic for jessicaberry.info, sends /api* to Django on port 8080, and everything else to a static server on port 9000. Backends are started with nohup so they survive SSH logout — otherwise the proxy stays up and visitors see 502 Bad Gateway when the upstream processes die with the session.',
      },
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
