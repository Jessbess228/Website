import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { Footer } from '../components/Footer'
import { getProjectBySlug } from '../data/projects'

export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (!project) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
          Project not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          That project does not exist yet.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained">
          Back home
        </Button>
      </Container>
    )
  }

  return (
    <Fade in timeout={reduceMotion ? 0 : 500}>
      <Box component="main">
        <Container maxWidth="md" sx={{ pt: { xs: 5, md: 8 }, pb: 2 }}>
          <Box sx={{ maxWidth: 720, mx: 'auto' }}>
            <Button
              component={RouterLink}
              to="/"
              color="primary"
              sx={{ mb: 3, px: 0, minWidth: 0 }}
            >
              ← Back home
            </Button>

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
                position: 'relative',
                width: 'fit-content',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  right: '12%',
                  bottom: 4,
                  height: 3,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  transform: 'rotate(-1deg)',
                },
              }}
            >
              {project.title}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {project.summary}
            </Typography>

            <Stack
              direction="row"
              flexWrap="wrap"
              useFlexGap
              spacing={1}
              sx={{ mb: 4 }}
            >
              {project.stack.map((tech) => (
                <Chip key={tech} label={tech} size="small" color="secondary" />
              ))}
            </Stack>

            <Stack spacing={2}>
              {project.body.map((paragraph) => (
                <Typography key={paragraph} variant="body1">
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Footer />
        </Container>
      </Box>
    </Fade>
  )
}
