/**
 * api/puppies.ts — thin client for the Go puppy / dog-breed API.
 *
 * Used by PuppiesPage. Requests go directly to the Go service:
 * - development defaults to `http://127.0.0.1:8080`
 * - production uses `VITE_PUPPY_API_BASE_URL`
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

const API_BASE_URL = (
  import.meta.env.VITE_PUPPY_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8080' : '')
).replace(/\/+$/, '')

function apiUrl(path: string): string {
  if (!API_BASE_URL) {
    throw new Error(
      'Puppy API is not configured. Set VITE_PUPPY_API_BASE_URL to the Go service origin when building the website.',
    )
  }
  return `${API_BASE_URL}${path}`
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

function statusMessage(label: string, status: number): string {
  if (status === 502 || status === 503 || status === 504) {
    return `${label}: Go API gateway error (${status}). Check that the Go service is running and reachable.`
  }
  if (status === 404) {
    return `${label}: not found (404). Check that the Go API exposes this route.`
  }
  if (status === 400) {
    return `${label}: bad request (400). Check filter values.`
  }
  if (status >= 500) {
    return `${label}: Go API server error (${status}). Check the Go service logs.`
  }
  return `${label}: request failed (${status}).`
}

async function readApiJson<T>(response: Response, label: string): Promise<T> {
  if (!response.ok) {
    throw new Error(statusMessage(label, response.status))
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
    // DNS / connection refused / offline / CORS, etc.
    throw new Error(
      `${label}: network error — could not reach ${path}. Check the Go API URL, that the Go service is running, and that its CORS_ALLOWED_ORIGINS includes this website's origin.`,
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
    apiUrl(`/api/puppies/${toQuery(params)}`),
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
  const data = await apiGetJson<PuppyFilters>(
    apiUrl('/api/puppies/filters/'),
    'Puppy filters',
    signal,
  )
  if (!data || !Array.isArray(data.sizes) || !Array.isArray(data.breed_groups)) {
    throw new Error('Puppy filters: JSON shape was unexpected (missing sizes/breed_groups).')
  }
  return data
}
