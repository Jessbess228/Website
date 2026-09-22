import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { design as d, weight } from '../designTokens'
import type { Project } from '../data/projects'

type ProjectTileProps = {
  project: Project
  /**
   * Position in the grid (0-based).
   * Used only to stagger the entrance animation so tiles don't all pop in together.
   */
  index?: number
}

export function ProjectTile({ project, index = 0 }: ProjectTileProps) {
  const href = project.href
  const linkProps = href
    ? { component: 'a' as const, href }
    : { component: RouterLink, to: `/${project.slug}` }

  return (
    // Flat card per the Figma frame: no surface, border, or rounding — the
    // whole tile is the link, since the design has no separate "view" cue.
    <Box
      {...linkProps}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        textDecoration: 'none',
        animation: 'tileIn 0.6s ease both',
        // Later tiles wait a bit longer → cascade effect
        animationDelay: `${0.15 + index * 0.08}s`,
        '@keyframes tileIn': {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        // Stands in for the removed CTA so the tile still reads as clickable
        '&:hover .ProjectTile-title': { color: d.rose },
        '&:focus-visible': { outline: `2px solid ${d.rose}`, outlineOffset: 4 },
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'none',
        },
      }}
    >
      <Box
        aria-hidden
        sx={{
          height: 100,
          width: '100%',
          // Tinted band keeps the grid's rhythm above each title
          background: `linear-gradient(135deg, ${d.sageTint}, ${d.panel})`,
        }}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography
          className="ProjectTile-title"
          component="h3"
          sx={{
            fontFamily: d.display,
            fontWeight: weight.regular,
            fontSize: 24,
            color: d.ink,
            m: 0,
            transition: 'color 0.2s ease',
          }}
        >
          {project.title}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
          {project.stack.map((tech) => (
            <Typography
              key={tech}
              component="span"
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: d.sageTint,
                color: d.pillInk,
                fontFamily: d.sans,
                fontWeight: weight.regular,
                fontSize: 12,
              }}
            >
              {tech}
            </Typography>
          ))}
        </Box>

        <Typography
          sx={{
            fontFamily: d.sans,
            fontWeight: weight.light,
            fontSize: 14,
            lineHeight: 1.5,
            color: d.body,
          }}
        >
          {project.summary}
        </Typography>
      </Box>
    </Box>
  )
}
