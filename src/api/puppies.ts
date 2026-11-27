/**
 * api/puppies.ts — thin client for the Django puppy / dog-breed API.
 *
 * Used by PuppiesPage. All paths are relative (`/api/…`) so:
 * - `npm run dev` → Vite proxy → Django :8080
 * - production (Cloud Run) → nginx → Gunicorn Django :8081
 *
 * Exports:
 * - TypeScript types matching the API JSON
 * - fetchPuppies() for the searchable list
 * - fetchPuppyFilters() for dropdown options + lifespan bounds
 */

/** One breed row from GET /api/puppies/ */
export type Puppy = {
  id: number
  name: string
  /** Life span string from the API (often a range like "10 - 12") */
  age: string
  size: string
  weight: string
  breed_group: string
  temperament: string
  /** Photo URL, or the sentinel string "n/a" when missing */
  first_photo_url: string
  updated_at: string
}

/**
 * Filter metadata from GET /api/puppies/filters/.
 * Powers Size / Breed group selects and the life-span slider min/max.
 */
export type PuppyFilters = {
  sizes: string[]
  breed_groups: string[]
  lifespan_min: number
  lifespan_max: number
}

export type PuppySearchParams = {
  name?: string
  size?: string
  breed_group?: string
  q?: string
  min_lifespan?: number
  max_lifespan?: number
}

export type PuppyListResponse = {
  count: number
  results: Puppy[]
}

function toQuery(params: PuppySearchParams): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    // filter out undefined, null, and empty strings
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

function runningLocally(): boolean {
  if (import.meta.env.DEV) return true
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1'
}

function localApiHint(): string {
  return 'Start the puppy API: `cd puppy-api && python manage.py runserver 8080` (Vite proxies /api to port 8080).'
}

function prodApiHint(): string {
  return 'Check Google Cloud Run → service website → Logs (filter: gunicorn, Traceback, puppies.db).'
}

async function responseBodyHint(response: Response): Promise<string | undefined> {
  const contentType = response.headers.get('content-type') ?? ''
  let body = ''
  try {
    body = (await response.text()).slice(0, 2000)
  } catch {
    return undefined
  }

  if (contentType.includes('application/json')) {
    try {
      const data = JSON.parse(body) as Record<string, unknown>
      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail.trim()
      }
    } catch {
      /* ignore */
    }
    return undefined
  }

  if (contentType.includes('text/html') || body.trimStart().startsWith('<')) {
    if (response.status >= 500) {
      return 'Django returned an HTML error page (not JSON) — usually an unhandled exception in the API (e.g. missing SQLite table `dogs_puppy` when `data/puppies.db` is empty).'
    }
    return 'Got the SPA HTML page instead of JSON — `/api` is not reaching Django (proxy/nginx routing).'
  }

  return undefined
}

function statusMessage(label: string, status: number, bodyHint?: string): string {
  const local = runningLocally()

  if (status === 502 || status === 503 || status === 504) {
    const where = local
      ? `Upstream Django is not responding. ${localApiHint()}`
      : `Gunicorn on :8081 is down or nginx could not reach it. ${prodApiHint()}`
    return `${label}: gateway error (${status}). ${where}`
  }

  if (status === 404) {
    return `${label}: not found (404). Django has no route for this URL — check puppy-api URL config.`
  }

  if (status === 400) {
    return `${label}: bad request (400). One of the filter query parameters may be invalid.`
  }

  if (status >= 500) {
    const tail = bodyHint
      ? bodyHint
      : local
        ? `Django failed while handling the request. Confirm \`data/puppies.db\` exists and has breed data; see the terminal where runserver is running.`
        : `Django failed while handling the request. ${prodApiHint()}`
    return `${label}: server error (${status}). ${tail}`
  }

  return `${label}: request failed (HTTP ${status}).`
}

async function readApiJson<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    const bodyHint = await responseBodyHint(response)
    throw new Error(statusMessage(label, response.status, bodyHint))
  }
  return (await response.json()) as T
}

async function apiGetJson<T>(path: string, label: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { signal })
  } catch (err) {
    // Aborts are normal when filters change quickly — rethrow so callers can ignore them
    if ((err as Error).name === 'AbortError') throw err
    const local = runningLocally()
    throw new Error(
      local
        ? `${label}: network error — could not reach ${path}. ${localApiHint()}`
        : `${label}: network error — could not reach ${path}. Check your connection and that the website service is deployed.`,
    )
  }
  return readApiJson<T>(response, label)
}

/**
 * GET /api/puppies/?… — filtered breed list for the cards grid.
 */
export async function fetchPuppies(
  params: PuppySearchParams = {},
  signal?: AbortSignal,
): Promise<PuppyListResponse> {
  const data = await apiGetJson<PuppyListResponse>(
    `/api/puppies/${toQuery(params)}`,
    'Puppy list',
    signal,
  )
  // Light runtime guard in case the API schema drifts
  if (!data || !Array.isArray(data.results)) {
    throw new Error('Puppy list: JSON shape was unexpected (missing results array).')
  }
  return data
}

/**
 * GET /api/puppies/filters/ — distinct sizes/groups + lifespan extent.
 */
export async function fetchPuppyFilters(signal?: AbortSignal): Promise<PuppyFilters> {
  const data = await apiGetJson<PuppyFilters>('/api/puppies/filters/', 'Puppy filters', signal)
  if (!data || !Array.isArray(data.sizes) || !Array.isArray(data.breed_groups)) {
    throw new Error(
      'Puppy filters: JSON shape was unexpected (missing sizes/breed_groups) — the response may be HTML from the wrong upstream.',
    )
  }
  return data
}