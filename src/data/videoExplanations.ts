/**
 * Architecture walkthrough episodes — scripts in docs/VIDEO-SCRIPTS.md.
 *
 * How to embed YouTube:
 * 1. Upload the video on YouTube.
 * 2. Copy the ID from the watch URL, e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ → `dQw4w9WgXcQ`
 * 3. Paste it in `youtubeId` below (not the full URL).
 */
export type VideoExplanationEpisode = {
  n: number
  title: string
  topic: string
  /** YouTube video ID only (11-char id from watch?v=…) */
  youtubeId: string
}

export const videoExplanations: VideoExplanationEpisode[] = [
  {
    n: 1,
    title: 'The website you see in the browser',
    topic: 'React portfolio and routing',
    youtubeId: '',
  },
  {
    n: 2,
    title: 'The web server that sorts traffic',
    topic: 'nginx — static files, /api proxy, builder proxy',
    youtubeId: '',
  },
  {
    n: 3,
    title: 'The puppies brain (Django)',
    topic: 'GET /api/puppies and search',
    youtubeId: '',
  },
  {
    n: 4,
    title: 'Where the dog data comes from',
    topic: 'SQLite, The Dog API, scheduler',
    youtubeId: '',
  },
  {
    n: 5,
    title: 'The page builder (Puck)',
    topic: 'Layout JSON and admin on sync',
    youtubeId: '',
  },
  {
    n: 6,
    title: 'The CMS back office',
    topic: 'Login, save layout, bookings',
    youtubeId: '',
  },
  {
    n: 7,
    title: 'Two Cloud Run services, one domain',
    topic: 'website + sync and SYNC_APP_ORIGIN',
    youtubeId: '',
  },
  {
    n: 8,
    title: 'Persistent layout in the cloud',
    topic: 'GCS bucket and LAYOUT_PATH',
    youtubeId: '',
  },
]

export const videoScriptsRepoUrl =
  'https://github.com/Jessbess228/Website/blob/videos/docs/VIDEO-SCRIPTS.md'