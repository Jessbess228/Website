import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BackHome } from '../components/BackHome'
import { Footer } from '../components/Footer'
import { getProjectBySlug } from '../data/projects'

const project = getProjectBySlug('sync-consulting')

/** Portfolio host for the Sync Consulting app (proxied at /sync-app/). */
export function SyncConsultingPage() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 2 }}>
        <BackHome />

        {project ? (
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="h1" component="h1">
              {project.title}
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 52 * 8 }}>
              {project.summary}
            </Typography>
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
              {project.stack.map((tech) => (
                <Chip key={tech} label={tech} size="small" variant="outlined" />
              ))}
            </Stack>
            {project.body.map((paragraph) => (
              <Typography key={paragraph} color="text.secondary">
                {paragraph}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </Container>

      <Box
        sx={{
          flex: 1,
          minHeight: { xs: '70vh', md: '75vh' },
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: '#0b1220',
        }}
      >
        <Box
          component="iframe"
          title="Sync Consulting"
          src="/sync-app/"
          sx={{
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: { xs: '70vh', md: '75vh' },
            border: 0,
          }}
        />
      </Box>

      <Footer />
    </Box>
  )
}
