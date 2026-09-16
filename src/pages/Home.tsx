import Box from '@mui/material/Box'
import { Footer } from '../components/Footer'
import { HeroResume } from '../components/HeroResume'
import { ProjectTile } from '../components/ProjectTile'
import { Section } from '../components/Section'
import { projects } from '../data/projects'

export function Home() {
  return (
    <Box component="main">
      {/* Full-bleed hero + resume, so the photo runs to the viewport edge */}
      <HeroResume />

      {/* Everything below stays on the site's standard centred column */}
      <Box sx={{ px: { xs: 2, sm: 3 } }}>
        <Section id="projects" eyebrow="Selected work" title="Projects">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              // 40px both axes, per the Figma grid
              gap: 5,
              alignItems: 'start',
            }}
          >
            {projects.map((project, i) => (
              <ProjectTile key={project.slug} project={project} index={i} />
            ))}
          </Box>
        </Section>

        <Box sx={{ maxWidth: 880, mx: 'auto' }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  )
}
