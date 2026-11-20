/** Episodes aligned with docs/VIDEO-SCRIPTS.md on the `videos` branch. */
export const videoExplanations = [
  {
    n: 1,
    title: 'The website you see in the browser',
    topic: 'React portfolio and routing',
  },
  {
    n: 2,
    title: 'The web server that sorts traffic',
    topic: 'nginx — static files, /api proxy, builder proxy',
  },
  {
    n: 3,
    title: 'The puppies brain (Django)',
    topic: 'GET /api/puppies and search',
  },
  {
    n: 4,
    title: 'Where the dog data comes from',
    topic: 'SQLite, The Dog API, scheduler',
  },
  {
    n: 5,
    title: 'The page builder (Puck)',
    topic: 'Layout JSON and admin on sync',
  },
  {
    n: 6,
    title: 'The CMS back office',
    topic: 'Login, save layout, bookings',
  },
  {
    n: 7,
    title: 'Two Cloud Run services, one domain',
    topic: 'website + sync and SYNC_APP_ORIGIN',
  },
  {
    n: 8,
    title: 'Persistent layout in the cloud',
    topic: 'GCS bucket and LAYOUT_PATH',
  },
] as const

export const videoScriptsRepoUrl =
  'https://github.com/Jessbess228/Website/blob/videos/docs/VIDEO-SCRIPTS.md'