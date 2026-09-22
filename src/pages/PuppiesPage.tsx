import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Fade from '@mui/material/Fade'
import InputBase from '@mui/material/InputBase'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import {
  fetchPuppies,
  fetchPuppyFilters,
  type Puppy,
  type PuppyFilters,
  type PuppySearchParams,
} from '../api/puppies'
import { Footer } from '../components/Footer'
import { design as d, weight } from '../designTokens'
import { getProjectBySlug } from '../data/projects'

const project = getProjectBySlug('puppies')

const DEFAULT_LIFESPAN: [number, number] = [0, 20]

// Placeholder filter lists so the UI can render before the filters request returns
const emptyFilters: PuppyFilters = {
  sizes: [],
  breed_groups: [],
  lifespan_min: DEFAULT_LIFESPAN[0],
  lifespan_max: DEFAULT_LIFESPAN[1],
}

/** Icons exported from the Figma frame; sizes are the designed leaf dimensions. */
const icons = {
  search: { src: '/images/icons/search.svg', size: 18 },
  chevron: { src: '/images/icons/chevron-down.svg', size: 14 },
  scale: { src: '/images/icons/scale.svg', size: 14 },
  clock: { src: '/images/icons/clock.svg', size: 14 },
  dot: { src: '/images/icons/dot.svg', size: 6 },
} as const

function Icon({ icon }: { icon: { src: string; size: number } }) {
  return (
    <Box
      component="img"
      src={icon.src}
      alt=""
      aria-hidden
      sx={{ width: icon.size, height: icon.size, display: 'block', flexShrink: 0 }}
    />
  )
}

/** Small caps label above each filter field. */
function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="span"
      sx={{
        fontFamily: d.sans,
        fontWeight: weight.bold,
        fontSize: 11,
        textTransform: 'uppercase',
        color: d.body,
      }}
    >
      {children}
    </Typography>
  )
}

/** Shared shell for the text input and the two selects. */
const fieldSx = {
  bgcolor: d.offWhite,
  border: `1px solid ${d.hairlineSoft}`,
  borderRadius: '6px',
  px: '14px',
  py: '10px',
  fontFamily: d.sans,
  fontSize: 13,
  color: d.ink,
} as const

const buttonSx = {
  borderRadius: '6px',
  px: '18px',
  py: '10px',
  fontFamily: d.sans,
  fontWeight: weight.bold,
  fontSize: 13,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  '&:focus-visible': { outline: `2px solid ${d.rose}`, outlineOffset: 2 },
} as const

const metaTextSx = {
  fontFamily: d.sans,
  fontSize: 13,
  color: d.body,
} as const

type FilterSelectProps = {
  label: string
  /** Shown as the value when nothing is chosen, and as the "no filter" option. */
  placeholder: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

/**
 * Size / breed-group dropdown. The open menu is styled here too — left alone it
 * inherits the older cream MUI theme the rest of this page has moved off.
 */
function FilterSelect({ label, placeholder, value, options, onChange }: FilterSelectProps) {
  return (
    <Stack spacing={0.75}>
      <FieldLabel>{label}</FieldLabel>
      <Select
        variant="standard"
        disableUnderline
        displayEmpty
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputProps={{ 'aria-label': label }}
        renderValue={(current) => (current ? String(current) : placeholder)}
        IconComponent={(props) => (
          <Box {...props} component="img" src={icons.chevron.src} alt="" aria-hidden />
        )}
        MenuProps={{
          MenuListProps: { sx: { py: 0.5 } },
          PaperProps: {
            sx: {
              mt: 0.5,
              bgcolor: d.offWhite,
              border: `1px solid ${d.hairlineSoft}`,
              borderRadius: '6px',
              // Keeps the highlighted row inside the rounded corners
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(58, 48, 48, 0.08)',
              '& .MuiMenuItem-root': {
                minHeight: 'unset',
                px: '14px',
                py: '8px',
                fontFamily: d.sans,
                fontSize: 13,
                color: d.ink,
                '&:hover': { bgcolor: `rgba(${d.roseRgb}, 0.08)` },
                '&.Mui-selected': {
                  bgcolor: `rgba(${d.roseRgb}, 0.12)`,
                  fontWeight: weight.bold,
                  '&:hover': { bgcolor: `rgba(${d.roseRgb}, 0.16)` },
                },
              },
            },
          },
        }}
        sx={{
          ...fieldSx,
          '& .MuiSelect-select': {
            p: 0,
            pr: '22px !important',
            minHeight: 'unset',
            bgcolor: 'transparent',
          },
          '& .MuiSelect-icon': {
            width: icons.chevron.size,
            height: icons.chevron.size,
            right: '14px',
            top: 'calc(50% - 7px)',
          },
        }}
      >
        <MenuItem value="">{placeholder}</MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  )
}

export function PuppiesPage() {
  // Accessibility: skip Fade when the user prefers reduced motion
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // ----- React state -----

  // default so that the page can render before /api/puppies/filters/ returns
  const [filters, setFilters] = useState<PuppyFilters>(emptyFilters)

  // slider position (state is updated when dragged)
  const [lifespanRange, setLifespanRange] = useState<[number, number]>(DEFAULT_LIFESPAN)
  // search parameters (state is updated when user types)
  const [params, setParams] = useState<PuppySearchParams>({
    q: '',
    name: '',
    size: '',
    breed_group: '',
    min_lifespan: DEFAULT_LIFESPAN[0],
    max_lifespan: DEFAULT_LIFESPAN[1],
  })
  // Used in useEffect, this data is sent to the API
  const [debounced, setDebounced] = useState(params)
  const [retryKey, setRetryKey] = useState(0)
  const [puppies, setPuppies] = useState<Puppy[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Separate error to handle filter failure
  const [filtersError, setFiltersError] = useState<string | null>(null)

  // ----- Effects -----

  /**
   * Delayed params input → debounced.
   * effect: one API call after typing pauses, not one per keystroke.
   */
  useEffect(() => {
    const pendingTimeout = window.setTimeout(() => setDebounced(params), 300)
    return () => window.clearTimeout(pendingTimeout)
  }, [params])

  /* on mount, this effect runs fetchPuppyFilters()to get the filter options */
  useEffect(() => {
    const controller = new AbortController()
    setFiltersError(null)
    fetchPuppyFilters(controller.signal)
      .then((next) => {
        setFilters(next)
        const range: [number, number] = [next.lifespan_min, next.lifespan_max]
        setLifespanRange(range)
        // Seed search params with the real lifespan extent from the DB
        setParams((prev) => ({
          ...prev,
          min_lifespan: range[0],
          max_lifespan: range[1],
        }))
      })
      .catch((err: unknown) => {
        // Ignore aborts — expected on navigation away
        if ((err as Error).name === 'AbortError') return
        console.error(err)
        setFiltersError(err instanceof Error ? err.message : 'Could not load puppy filters.')
      })
    return () => controller.abort()
  }, [])

  /**
   * Fetch the breed list whenever debounced filters or retryKey change.
   * AbortController cancels the previous request when dependencies change.
   */
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetchPuppies(debounced, controller.signal)
      .then((data) => {
        setPuppies(data.results)
        setCount(data.count)
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Could not load puppies.')
        setPuppies([])
        setCount(0)
      })
      .finally(() => {
        // Only clear spinner if THIS request is still the active one
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [debounced, retryKey])

  // ----- Event helpers -----

  /** Patch one string filter field on `params`. */
  const update = (key: keyof PuppySearchParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  /** Re-run search immediately (bypass waiting for debounce). */
  const retrySearch = () => {
    setDebounced(params)
    setRetryKey((key) => key + 1)
  }

  /** Reset all filters to empty / full lifespan range from the API. */
  const clearFilters = () => {
    const range: [number, number] = [filters.lifespan_min, filters.lifespan_max]
    setLifespanRange(range)
    setParams({
      q: '',
      name: '',
      size: '',
      breed_group: '',
      min_lifespan: range[0],
      max_lifespan: range[1],
    })
  }

  // ----- Render -----

  return (
    <Fade in timeout={reduceMotion ? 0 : 500}>
      <Box
        component="main"
        sx={{
          px: { xs: 3, sm: 5, md: '80px' },
          pt: { xs: 4, md: '48px' },
          pb: { xs: 6, md: '80px' },
        }}
      >
        <Box
          sx={{
            maxWidth: 1080,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 4, md: '48px' },
          }}
        >
          {/* ---- Page intro (copy from projects.ts) ---- */}
          <Stack spacing={2} sx={{ maxWidth: 800 }}>
            <Typography
              sx={{
                fontFamily: d.sans,
                fontWeight: weight.black,
                fontSize: 12,
                textTransform: 'uppercase',
                color: d.rose,
              }}
            >
              ✦ Project Showcase
            </Typography>

            <Typography
              component="h1"
              sx={{
                fontFamily: d.display,
                fontWeight: weight.regular,
                fontSize: { xs: 36, md: 48 },
                lineHeight: 1.1,
                color: d.ink,
                m: 0,
              }}
            >
              {/* Fallback title if projects.ts entry is missing */}
              {project?.title ?? 'Dog Breed Data Collection'}
            </Typography>

            {[project?.summary, ...(project?.body ?? [])]
              .filter((paragraph): paragraph is string => Boolean(paragraph))
              .map((paragraph) => (
                <Typography
                  key={paragraph}
                  sx={{
                    fontFamily: d.sans,
                    fontWeight: weight.light,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: d.body,
                  }}
                >
                  {paragraph}
                </Typography>
              ))}
          </Stack>

          <Box aria-hidden sx={{ height: '1px', bgcolor: d.hairlineSoft }} />

          <Typography
            component="h2"
            sx={{
              fontFamily: d.display,
              fontWeight: weight.regular,
              fontSize: 32,
              color: d.ink,
              m: 0,
            }}
          >
            Browse the collection
          </Typography>

          {/* ---- Search / filter controls ---- */}
          <Box
            sx={{
              bgcolor: d.panel,
              border: `1px solid ${d.hairlineSoft}`,
              borderRadius: '12px',
              p: { xs: 2.5, md: '28px' },
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Free-text `q` — server-side search */}
            <Box
              sx={{
                ...fieldSx,
                borderRadius: '8px',
                px: '16px',
                py: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                '&:focus-within': { borderColor: d.rose },
              }}
            >
              <Icon icon={icons.search} />
              <InputBase
                value={params.q ?? ''}
                onChange={(event) => update('q', event.target.value)}
                placeholder="Search by breed name, alternative names, traits or country of origin..."
                inputProps={{ 'aria-label': 'Search breeds' }}
                sx={{
                  flex: 1,
                  fontFamily: d.sans,
                  fontSize: 14,
                  color: d.ink,
                  '& input': { p: 0 },
                  '& input::placeholder': { color: d.body, opacity: 1 },
                }}
              />
            </Box>

            {/* Four filter fields — one row on desktop, stacked on phones */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <Stack spacing={0.75}>
                <FieldLabel>Breed name</FieldLabel>
                <InputBase
                  value={params.name ?? ''}
                  onChange={(event) => update('name', event.target.value)}
                  placeholder="e.g. Retriever"
                  inputProps={{ 'aria-label': 'Breed name' }}
                  sx={{
                    ...fieldSx,
                    '& input': { p: 0 },
                    '& input::placeholder': { color: d.ink, opacity: 0.55 },
                    '&:focus-within': { borderColor: d.rose },
                  }}
                />
              </Stack>

              {/* Size dropdown — options from filters.sizes */}
              <FilterSelect
                label="Size"
                placeholder="Any Size"
                value={params.size ?? ''}
                options={filters.sizes}
                onChange={(value) => update('size', value)}
              />

              {/* Breed group dropdown — options from filters.breed_groups */}
              <FilterSelect
                label="Breed group"
                placeholder="All Groups"
                value={params.breed_group ?? ''}
                options={filters.breed_groups}
                onChange={(value) => update('breed_group', value)}
              />

              {/*
                Life-span range slider.
                onChange = drag preview; onChangeCommitted = actually search.
              */}
              <Stack spacing={0.75}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <FieldLabel>Lifespan</FieldLabel>
                  <Typography
                    component="span"
                    sx={{
                      fontFamily: d.sans,
                      fontWeight: weight.bold,
                      fontSize: 11,
                      color: d.rose,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {lifespanRange[0]} – {lifespanRange[1]} Years
                  </Typography>
                </Box>
                <Box sx={{ height: 36, display: 'flex', alignItems: 'center', px: '8px' }}>
                  <Slider
                    value={lifespanRange}
                    min={filters.lifespan_min}
                    max={filters.lifespan_max}
                    step={1}
                    disableSwap // keep min handle left of max handle
                    getAriaLabel={(index) => (index === 0 ? 'Minimum lifespan' : 'Maximum lifespan')}
                    onChange={(_event, value) => {
                      const range = value as [number, number]
                      setLifespanRange(range)
                    }}
                    onChangeCommitted={(_event, value) => {
                      const [min, max] = value as [number, number]
                      setParams((prev) => ({
                        ...prev,
                        min_lifespan: min,
                        max_lifespan: max,
                      }))
                    }}
                    sx={{
                      color: d.rose,
                      height: 4,
                      p: 0,
                      '& .MuiSlider-rail': {
                        height: 4,
                        borderRadius: '999px',
                        bgcolor: d.hairlineSoft,
                        opacity: 1,
                      },
                      '& .MuiSlider-track': { height: 4, borderRadius: '999px', border: 'none' },
                      '& .MuiSlider-thumb': {
                        width: 16,
                        height: 16,
                        bgcolor: d.card,
                        border: `2px solid ${d.rose}`,
                        '&:hover, &.Mui-focusVisible': {
                          boxShadow: `0 0 0 6px rgba(${d.roseRgb}, 0.16)`,
                        },
                      },
                    }}
                  />
                </Box>
              </Stack>
            </Box>

            {/* Actions + live result count */}
            <Box
              sx={{
                pt: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', gap: '12px' }}>
                <Box
                  component="button"
                  type="button"
                  onClick={clearFilters}
                  sx={{
                    ...buttonSx,
                    bgcolor: 'transparent',
                    border: `1px solid ${d.rose}`,
                    color: d.rose,
                    '&:hover': { bgcolor: `rgba(${d.roseRgb}, 0.08)` },
                  }}
                >
                  Clear filters
                </Box>
                <Box
                  component="button"
                  type="button"
                  onClick={retrySearch}
                  disabled={loading}
                  sx={{
                    ...buttonSx,
                    bgcolor: d.rose,
                    border: `1px solid ${d.rose}`,
                    color: d.offWhite,
                    '&:hover': { bgcolor: d.ink, borderColor: d.ink },
                    '&:disabled': { opacity: 0.6, cursor: 'default' },
                  }}
                >
                  Retry search
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: d.offWhite,
                  borderRadius: '20px',
                  px: '12px',
                  py: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Icon icon={icons.dot} />
                <Typography
                  component="span"
                  sx={{
                    fontFamily: d.sans,
                    fontWeight: weight.bold,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    color: d.sage,
                  }}
                >
                  {loading
                    ? 'Searching…'
                    : `${count} breed${count === 1 ? '' : 's'} matching filters`}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ---- Status / empty / loading ---- */}

          {filtersError && (
            <Typography sx={{ ...metaTextSx, color: d.rose }}>{filtersError}</Typography>
          )}

          {error && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Typography sx={{ ...metaTextSx, flex: 1, color: d.rose }}>{error}</Typography>
              <Box
                component="button"
                type="button"
                onClick={retrySearch}
                sx={{
                  ...buttonSx,
                  bgcolor: 'transparent',
                  border: `1px solid ${d.rose}`,
                  color: d.rose,
                  '&:hover': { bgcolor: `rgba(${d.roseRgb}, 0.08)` },
                }}
              >
                Retry
              </Box>
            </Box>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress sx={{ color: d.rose }} />
            </Box>
          )}

          {/* Successful response but zero matches */}
          {!loading && !error && puppies.length === 0 && (
            <Typography sx={metaTextSx}>
              No dogs match these filters yet. The API refreshes from The Dog API on an
              interval, so try again shortly or clear filters.
            </Typography>
          )}

          {/* ---- Result cards ---- */}
          {!loading && puppies.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 5,
              }}
            >
              {puppies.map((puppy) => (
                <Box
                  key={puppy.id}
                  sx={{
                    bgcolor: d.card,
                    border: `1px solid ${d.panel}`,
                    borderRadius: '12px',
                    p: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    boxShadow: '0 4px 6px rgba(58, 48, 48, 0.04)',
                  }}
                >
                  {/* The tinted block stands in when the API sent "n/a" for the photo */}
                  <Box
                    sx={{
                      aspectRatio: '1 / 1',
                      width: '100%',
                      borderRadius: '8px',
                      bgcolor: d.imagePlaceholder,
                      overflow: 'hidden',
                    }}
                  >
                    {puppy.first_photo_url && puppy.first_photo_url !== 'n/a' && (
                      <Box
                        component="img"
                        src={puppy.first_photo_url}
                        alt={puppy.name}
                        loading="lazy"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    )}
                  </Box>

                  <Stack spacing={1.5}>
                    <Typography
                      component="h3"
                      sx={{
                        fontFamily: d.display,
                        fontWeight: weight.regular,
                        fontSize: 22,
                        color: d.ink,
                        m: 0,
                      }}
                    >
                      {puppy.name}
                    </Typography>

                    {/* Skip the pill when the backend used the "n/a" sentinel */}
                    {puppy.breed_group !== 'n/a' && (
                      <Box>
                        <Typography
                          component="span"
                          sx={{
                            display: 'inline-block',
                            px: '12px',
                            py: '6px',
                            borderRadius: '6px',
                            bgcolor: `rgba(${d.roseRgb}, 0.1)`,
                            fontFamily: d.sans,
                            fontWeight: weight.bold,
                            fontSize: 12,
                            color: d.rose,
                          }}
                        >
                          {puppy.breed_group}
                        </Typography>
                      </Box>
                    )}

                    <Stack spacing={0.75}>
                      {puppy.size !== 'n/a' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon icon={icons.scale} />
                          <Typography sx={metaTextSx}>
                            Size:{' '}
                            <Box
                              component="span"
                              sx={{ fontWeight: weight.bold, color: d.ink }}
                            >
                              {puppy.size}
                            </Box>
                          </Typography>
                        </Box>
                      )}
                      {puppy.age !== 'n/a' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Icon icon={icons.clock} />
                          <Typography sx={metaTextSx}>
                            Lifespan:{' '}
                            <Box
                              component="span"
                              sx={{ fontWeight: weight.bold, color: d.ink }}
                            >
                              {puppy.age} years
                            </Box>
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Box>
          )}

          <Footer />
        </Box>
      </Box>
    </Fade>
  )
}
