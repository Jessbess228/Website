import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Footer } from '../components/Footer'
import { ProjectTile } from '../components/ProjectTile'
import { Section } from '../components/Section'
import { projects } from '../data/projects'
import {
  contact,
  education,
  experience,
  skills,
  summary,
} from '../data/resume'

export function Home() {
  return (
    <Box component="main">
      <Container maxWidth="md" sx={{ pt: { xs: 6, md: 10 }, pb: 2 }}>
        <Box
          sx={{
            maxWidth: 720,
            mx: 'auto',
            animation: 'heroIn 0.7s ease both',
            '@keyframes heroIn': {
              from: { opacity: 0, transform: 'translateY(16px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '3rem', sm: '4.25rem', md: '5rem' },
              mb: 1,
            }}
          >
            Jessica
            <Box component="span" sx={{ display: 'block' }}>
              Berry
            </Box>
          </Typography>

          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mt: 2, mb: 1.5, fontSize: { xs: '1.05rem', md: '1.15rem' } }}
          >
            {contact.role}
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            <Link href={`mailto:${contact.email}`} color="inherit">
              {contact.email}
            </Link>
            {' · '}
            {contact.location}
          </Typography>

          <Typography variant="body1" color="text.primary" sx={{ maxWidth: 640 }}>
            {summary}
          </Typography>
        </Box>

        <Section id="experience" eyebrow="Career" title="Experience">
          <Stack spacing={4}>
            {experience.map((job) => (
              <Box key={`${job.company}-${job.title}`}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ sm: 'baseline' }}
                  spacing={0.5}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="h3" component="h3">
                    {job.title}{' '}
                    <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                      at {job.company}
                    </Box>
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}
                  >
                    {job.dates}
                  </Typography>
                </Stack>
                <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
                  {job.bullets.map((bullet) => (
                    <Typography
                      key={bullet}
                      component="li"
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.75 }}
                    >
                      {bullet}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        </Section>

        <Section id="projects" eyebrow="Selected work" title="Projects">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2.5,
            }}
          >
            {projects.map((project, index) => (
              <ProjectTile key={project.slug} project={project} index={index} />
            ))}
          </Box>
        </Section>

        <Section id="education" eyebrow="Study" title="Education">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'baseline' }}
            spacing={0.5}
          >
            <Box>
              <Typography variant="h3" component="h3">
                {education.degree}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {education.school}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {education.dates}
            </Typography>
          </Stack>
          <Typography variant="body2" color="primary" sx={{ mt: 1.5, fontWeight: 500 }}>
            {education.note}
          </Typography>
        </Section>

        <Section id="skills" eyebrow="Toolkit" title="Skills">
          <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
            {skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                variant="outlined"
                sx={{
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              />
            ))}
          </Stack>
        </Section>

        <Footer />
      </Container>
    </Box>
  )
}
