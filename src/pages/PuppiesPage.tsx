import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useEffect, useState } from 'react'
import {
  fetchPuppies,
  fetchPuppyFilters,
  type Puppy,
  type PuppyFilters,
  type PuppySearchParams,
} from '../api/puppies'
import { BackHome } from '../components/BackHome'
import { Footer } from '../components/Footer'
import { getProjectBySlug } from '../data/projects'

const project = getProjectBySlug('puppies')

const DEFAULT_LIFESPAN: [number, number] = [0, 20]

const emptyFilters: PuppyFilters = {
  sizes: [],
  breed_groups: [],
  lifespan_min: DEFAULT_LIFESPAN[0],
  lifespan_max: DEFAULT_LIFESPAN[1],
}

export function PuppiesPage() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const [filters, setFilters] = useState<PuppyFilters>(emptyFilters)
  const [lifespanRange, setLifespanRange] = useState<[number, number]>(DEFAULT_LIFESPAN)
  const [params, setParams] = useState<PuppySearchParams>({
    q: '',
    name: '',
    size: '',
    breed_group: '',
    min_lifespan: DEFAULT_LIFESPAN[0],
    max_lifespan: DEFAULT_LIFESPAN[1],
  })
  const [debounced, setDebounced] = useState(params)
  const [retryKey, setRetryKey] = useState(0)
  const [puppies, setPuppies] = useState<Puppy[]>([])
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersError, setFiltersError] = useState<string | null>(null)

  useEffect(() => {
    const handle = window.setTimeout(() => setDebounced(params), 300)
    return () => window.clearTimeout(handle)
  }, [params])

  useEffect(() => {
    const controller = new AbortController()
    setFiltersError(null)
    fetchPuppyFilters(controller.signal)
      .then((next) => {
        setFilters(next)
        const range: [number, number] = [next.lifespan_min, next.lifespan_max]
        setLifespanRange(range)
        setParams((prev) => ({
          ...prev,
          min_lifespan: range[0],
          max_lifespan: range[1],
        }))
      })
      .catch((err: unknown) => {
        if ((err as Error).name === 'AbortError') return
        console.error(err)
        setFiltersError(err instanceof Error ? err.message : 'Could not load puppy filters.')
      })
    return () => controller.abort()
  }, [])

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
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [debounced, retryKey])

  const update = (key: keyof PuppySearchParams, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const retrySearch = () => {
    setDebounced(params)
    setRetryKey((key) => key + 1)
  }

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

  return (
    <Fade in timeout={reduceMotion ? 0 : 500}>
      <Box component="main">
        <Container maxWidth="md" sx={{ pt: { xs: 5, md: 8 }, pb: 2 }}>
          <Box sx={{ maxWidth: 880, mx: 'auto' }}>
            <BackHome />

            <Typography
              variant="overline"
              color="primary"
              sx={{ display: 'block', mb: 1 }}
            >
              Project
            </Typography>

            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontSize: { xs: '2.25rem', md: '3.25rem' },
                mb: 2,
              }}
            >
              {project?.title ?? 'Puppy Data Collection'}
            </Typography>

            <Stack spacing={1.5} sx={{ mb: 4, maxWidth: 720 }}>
              {(project?.body ?? []).map((paragraph) => (
                <Typography key={paragraph} variant="body1" color="text.secondary">
                  {paragraph}
                </Typography>
              ))}
            </Stack>

            <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
              Browse the collection
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="Search"
                placeholder="Breed or group"
                value={params.q ?? ''}
                onChange={(event) => update('q', event.target.value)}
                fullWidth
                size="small"
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },
                  gap: 2,
                  alignItems: 'end',
                }}
              >
                <TextField
                  label="Breed name"
                  value={params.name ?? ''}
                  onChange={(event) => update('name', event.target.value)}
                  size="small"
                />
                <FormControl size="small">
                  <InputLabel id="size-label">Size</InputLabel>
                  <Select
                    labelId="size-label"
                    label="Size"
                    value={params.size ?? ''}
                    onChange={(event) => update('size', event.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    {filters.sizes.map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small">
                  <InputLabel id="group-label">Breed group</InputLabel>
                  <Select
                    labelId="group-label"
                    label="Breed group"
                    value={params.breed_group ?? ''}
                    onChange={(event) => update('breed_group', event.target.value)}
                  >
                    <MenuItem value="">Any</MenuItem>
                    {filters.breed_groups.map((group) => (
                      <MenuItem key={group} value={group}>
                        {group}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box
                  sx={{
                    px: 1.5,
                    pt: 0.75,
                    pb: 0.25,
                    minHeight: 40,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'grey.500',
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    '&:hover': {
                      borderColor: 'text.primary',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ lineHeight: 1.2, mb: 0.25 }}
                  >
                    Life span (years): {lifespanRange[0]} – {lifespanRange[1]}
                  </Typography>
                  <Slider
                    size="small"
                    value={lifespanRange}
                    min={filters.lifespan_min}
                    max={filters.lifespan_max}
                    step={1}
                    valueLabelDisplay="auto"
                    disableSwap
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
                      color: 'primary.main',
                      mx: 0.5,
                      py: 0.5,
                      '& .MuiSlider-markLabel': {
                        display: 'none',
                      },
                    }}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button onClick={clearFilters} variant="outlined" size="small">
                  Clear filters
                </Button>
                <Button
                  onClick={retrySearch}
                  variant="contained"
                  size="small"
                  disabled={loading}
                >
                  Retry search
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {loading ? 'Loading…' : `${count} result${count === 1 ? '' : 's'}`}
                </Typography>
              </Stack>
            </Stack>

            {filtersError && (
              <Typography color="warning.main" sx={{ mb: 2 }}>
                {filtersError}
              </Typography>
            )}

            {error && (
              <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
                <Typography color="error" sx={{ flex: 1 }}>
                  {error}
                </Typography>
                <Button onClick={retrySearch} variant="outlined" size="small" color="primary">
                  Retry
                </Button>
              </Stack>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress color="primary" />
              </Box>
            )}

            {!loading && !error && puppies.length === 0 && (
              <Typography color="text.secondary" sx={{ py: 4 }}>
                No dogs match these filters yet. The API refreshes from The Dog API on
                an interval, so try again shortly or clear filters.
              </Typography>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 2.5,
              }}
            >
              {!loading &&
                puppies.map((puppy) => (
                  <Card key={puppy.id} sx={{ overflow: 'hidden' }}>
                    {puppy.first_photo_url && puppy.first_photo_url !== 'n/a' ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={puppy.first_photo_url}
                        alt={puppy.name}
                        sx={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          bgcolor: 'secondary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography color="text.secondary">No photo</Typography>
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h3" component="h3" sx={{ mb: 1 }}>
                        {puppy.name}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1.5 }}>
                        {puppy.size !== 'n/a' && (
                          <Chip label={puppy.size} size="small" color="secondary" />
                        )}
                        {puppy.age !== 'n/a' && (
                          <Chip label={`${puppy.age} yrs`} size="small" variant="outlined" />
                        )}
                        {puppy.breed_group !== 'n/a' && (
                          <Chip label={puppy.breed_group} size="small" variant="outlined" />
                        )}
                      </Stack>
                      {puppy.temperament !== 'n/a' && (
                        <Typography variant="body2" color="text.secondary">
                          {puppy.temperament}
                        </Typography>
                      )}
                      {puppy.weight !== 'n/a' && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                          Weight: {puppy.weight}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </Box>
          </Box>

          <Footer />
        </Container>
      </Box>
    </Fade>
  )
}
