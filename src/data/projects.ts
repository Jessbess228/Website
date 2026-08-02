export type Project = {
  slug: string
  title: string
  summary: string
  stack: string[]
  body: string[]
}

export const projects: Project[] = [
  {
    slug: 'puppies',
    title: 'Puppy Data Collection',
    summary:
      'Scraped dog data from API loaded it to SQlite database',
    stack: ['Python', 'SQlite', 'API'],
    body: [
      'Using a Python script I ethically scraped an API from the website "The Dog API", and loaded it into a SQlite database.',
      'This project strengthened my understanding of API endpoints, python, use cases for different database types, and ethical data collection using scrapers.',
    ],
  },
]

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}
