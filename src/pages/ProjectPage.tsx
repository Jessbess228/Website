import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { BackHome } from '../components/BackHome'
import { Footer } from '../components/Footer'
import { getProjectBySlug } from '../data/projects'

/**
 * Generic project write-up page.
 * Content comes from `projects` in src/data/projects.ts, keyed by URL slug
 * (e.g. /this-website → slug "this-website").
 */
export function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const project = slug ? getProjectBySlug(slug) : undefined
  // Skip fade animation when the user prefers reduced motion
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Unknown slug (or typo in the URL) → simple not-found UI
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
            <BackHome />

            {/* Header: label, title, one-line summary, tech chips */}
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

            {/*
              Two content shapes:
              - sections: titled blocks (used by "This website")
              - body: plain paragraphs (used by older project entries)
            */}
            {project.sections && project.sections.length > 0 ? (
              <Stack spacing={4}>
                {project.sections.map((section) => (
                  <Box key={section.subtitle}>
                    <Typography
                      variant="h3"
                      component="h2"
                      sx={{ mb: 1.5, fontSize: { xs: '1.35rem', md: '1.5rem' } }}
                    >
                      {section.subtitle}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {section.body}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {project.body.map((paragraph) => (
                  <Typography key={paragraph} variant="body1">
                    {paragraph}
                  </Typography>
                ))}
              </Stack>
            )}
          </Box>

          <Footer />
        </Container>
      </Box>
    </Fade>
  )
}
