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

export async function fetchPuppies(
  params: PuppySearchParams = {},
  signal?: AbortSignal,
): Promise<PuppyListResponse> {
  const response = await fetch(`/api/puppies/${toQuery(params)}`, { signal })
  if (!response.ok) {
    throw new Error(`Could not load puppies (${response.status})`)
  }
  return response.json()
}

export async function fetchPuppyFilters(signal?: AbortSignal): Promise<PuppyFilters> {
  const response = await fetch('/api/puppies/filters/', { signal })
  if (!response.ok) {
    throw new Error(`Could not load filters (${response.status})`)
  }
  return response.json()
}
