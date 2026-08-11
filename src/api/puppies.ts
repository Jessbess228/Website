export type Puppy = {
  id: number
  name: string
  age: string
  size: string
  weight: string
  breed_group: string
  temperament: string
  first_photo_url: string
  updated_at: string
}

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
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ''
}

function statusMessage(label: string, status: number): string {
  if (status === 502 || status === 503 || status === 504) {
    return `${label}: gateway error (${status}). The proxy is up but Django on :8080 (or serve on :9000) is probably down — restart with nohup after SSH login.`
  }
  if (status === 404) {
    return `${label}: not found (404). Check the API route exists on Django.`
  }
  if (status === 400) {
    return `${label}: bad request (400). Check filter values.`
  }
  if (status >= 500) {
    return `${label}: server error (${status}). Check Django logs (/tmp/django-8080.log).`
  }
  return `${label}: request failed (${status}).`
}

async function readApiJson<T>(response: Response, label: string): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''

  if (!response.ok) {
    throw new Error(statusMessage(label, response.status))
  }

  if (contentType.includes('text/html')) {
    throw new Error(
      `${label}: got HTML instead of JSON. Caddy is likely proxying /api to the static site — use handle /api* → 127.0.0.1:8080 (not only /api/*).`,
    )
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      `${label}: expected JSON but got ${contentType || 'no content-type'}.`,
    )
  }

  return (await response.json()) as T
}

async function apiGetJson<T>(path: string, label: string, signal?: AbortSignal): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, { signal })
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    throw new Error(
      `${label}: network error — could not reach ${path}. Locally run Django on :8080; on EC2 check Caddy and nohup processes.`,
    )
  }
  return readApiJson<T>(response, label)
}

export async function fetchPuppies(
  params: PuppySearchParams = {},
  signal?: AbortSignal,
): Promise<PuppyListResponse> {
  const data = await apiGetJson<PuppyListResponse>(
    `/api/puppies/${toQuery(params)}`,
    'Puppy list',
    signal,
  )
  if (!data || !Array.isArray(data.results)) {
    throw new Error('Puppy list: JSON shape was unexpected (missing results array).')
  }
  return data
}

export async function fetchPuppyFilters(signal?: AbortSignal): Promise<PuppyFilters> {
  const data = await apiGetJson<PuppyFilters>('/api/puppies/filters/', 'Puppy filters', signal)
  if (!data || !Array.isArray(data.sizes) || !Array.isArray(data.breed_groups)) {
    throw new Error('Puppy filters: JSON shape was unexpected (missing sizes/breed_groups).')
  }
  return data
}
